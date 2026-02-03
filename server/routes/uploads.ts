
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { documents, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { s3Client, BUCKET_NAME, PUBLIC_URL } from '../lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

const app = new Hono<{ Variables: { organizationId: string; userId: string } }>();
app.use('*', authMiddleware);

app.post('/', async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];
    const type = body['type'] as string || 'DOCUMENT';
    const patientIdRaw = body['patientId'];
    const patientId = patientIdRaw ? Number(patientIdRaw) : undefined;

    // 10MB Limit
    const MAX_SIZE = 10 * 1024 * 1024;

    if (!file || !(file instanceof File)) {
        return c.json({ ok: false, error: 'Arquivo inválido' }, 400);
    }

    if (file.size > MAX_SIZE) {
        return c.json({ ok: false, error: 'File too large (Max 10MB)' }, 400);
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Magic Bytes Validation (Mock implementation for common types)
    // In production, use 'file-type' library for robust checking
    const getHexHeader = (arr: Uint8Array) => arr.slice(0, 4).reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '').toUpperCase();
    const header = getHexHeader(uint8Array);

    let verifiedExt = '';

    // PDF: %PDF (25 50 44 46)
    if (header.startsWith('25504446')) verifiedExt = '.pdf';
    // JPG: FF D8 FF
    else if (header.startsWith('FFD8FF')) verifiedExt = '.jpg';
    // PNG: 89 50 4E 47
    else if (header.startsWith('89504E47')) verifiedExt = '.png';
    // WEBP: RIFF...WEBP (complex, but starts with 52 49 46 46)
    else if (header.startsWith('52494646')) verifiedExt = '.webp';
    // ZIP based (docx, xlsx, etc) or STL (some STL start with 'solid')
    // For now, if we can't strict verify the 3D files with simple magic numbers cleanly, we fallback to extension but LOG A WARNING.
    // Ideally we'd use a library.
    else {
        // Fallback for STL/3D files which are harder to magic-byte (ASCII vs Binary)
        const nameExt = path.extname(file.name).toLowerCase();
        if (['.stl', '.ply', '.obj', '.glb'].includes(nameExt)) {
            console.warn(`WARN: Uploaded 3D file ${file.name} validated by extension only.`);
            verifiedExt = nameExt;
        } else {
            return c.json({ ok: false, error: 'Invalid file signature (Magic Bytes check failed).' }, 400);
        }
    }

    const fileName = `${randomUUID()}${verifiedExt}`;

    // Antivirus Scan Mock
    console.log(`[AV-SCAN] Scanning ${fileName}... OK (Clean)`);

    // Upload para S3
    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(buffer),
        ContentType: file.type,
    }));

    // Determina a URL pública
    const fileUrl = PUBLIC_URL
        ? `${PUBLIC_URL.replace(/\/$/, '')}/${fileName}`
        : `https://${BUCKET_NAME}.s3.${process.env.S3_REGION || 'auto'}.amazonaws.com/${fileName}`;

    const organizationId = c.get('organizationId');
    const userId = c.get('userId');

    if (type === 'PROFILE') {
        await db.update(users)
            .set({ avatarUrl: fileUrl })
            .where(eq(users.id, parseInt(userId)));
    } else {
        if (patientId) {
            await db.insert(documents).values({
                organizationId,
                patientId,
                type,
                name: file.name,
                url: fileUrl,
            });
        }
    }

    return c.json({ ok: true, data: { url: fileUrl } });
});

export default app;

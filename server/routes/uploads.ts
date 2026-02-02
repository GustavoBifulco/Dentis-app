
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { documents, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { s3Client, BUCKET_NAME, PUBLIC_URL } from '../lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

const app = new Hono<{ Variables: { organizationId: number; userId: number } }>();
app.use('*', authMiddleware);

app.post('/', async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'];
    const type = body['type'] as string || 'DOCUMENT';
    const patientIdRaw = body['patientId'];
    const patientId = patientIdRaw ? Number(patientIdRaw) : undefined;

    if (!file || !(file instanceof File)) {
        return c.json({ ok: false, error: 'Arquivo inválido' }, 400);
    }

    const ext = path.extname(file.name).toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.stl', '.ply', '.obj', '.glb', '.gltf'];

    if (!validExtensions.includes(ext)) {
        return c.json({ ok: false, error: 'Formato não suportado.' }, 400);
    }

    const fileName = `${randomUUID()}${ext}`;
    const buffer = await file.arrayBuffer();

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
            .where(eq(users.id, userId));
    } else {
        if (patientId) {
            await db.insert(documents).values({
                organizationId,
                patientId,
                type,
                filename: file.name,
                url: fileUrl,
                uploadedBy: userId
            });
        }
    }

    return c.json({ ok: true, data: { url: fileUrl } });
});

export default app;

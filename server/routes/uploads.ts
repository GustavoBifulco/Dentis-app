
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { documents, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const app = new Hono<{ Variables: { clinicId: string; userId: string } }>();
app.use('*', authMiddleware);

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Garantir diretório existe
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.post('/', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];
  const type = body['type'] as string || 'DOCUMENT'; // 'PROFILE', 'XRAY', etc
  const patientId = body['patientId'] as string;

  if (!file || !(file instanceof File)) {
      return c.json({ ok: false, error: 'Arquivo inválido' }, 400);
  }

  // Validação
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
      return c.json({ ok: false, error: 'Formato não suportado. Use JPG, PNG ou PDF.' }, 400);
  }

  // Salvar no disco
  const ext = path.extname(file.name);
  const fileName = `${randomUUID()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  
  const buffer = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));

  const publicUrl = `/uploads/${fileName}`;
  const clinicId = c.get('clinicId');
  const userId = c.get('userId');

  // Lógica Específica por Tipo
  if (type === 'PROFILE') {
      // Atualizar Avatar do Usuário
      await db.update(users)
        .set({ avatarUrl: publicUrl })
        .where(eq(users.id, userId));
  } else {
      // Registrar Documento (se tiver patientId)
      if (patientId) {
          await db.insert(documents).values({
              clinicId,
              patientId,
              type,
              filename: file.name,
              url: publicUrl,
              uploadedBy: userId
          });
      }
  }

  return c.json({ ok: true, data: { url: publicUrl } });
});

export default app;

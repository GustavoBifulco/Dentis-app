
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { campaigns, messageLogs, patients } from '../db/schema';
import { eq, and, lte, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { HTTPException } from 'hono/http-exception';

const app = new Hono<{ Variables: { clinicId: string; userId: string; role: string } }>();

app.use('*', authMiddleware);

const campaignSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['WHATSAPP', 'EMAIL']),
  targetAudience: z.enum(['ALL', 'INACTIVE_6_MONTHS', 'BIRTHDAY']),
  messageTemplate: z.string().min(10),
  sendNow: z.boolean().default(false),
});

// GET /api/marketing/campaigns
app.get('/campaigns', async (c) => {
  const clinicId = c.get('clinicId');
  const list = await db.query.campaigns.findMany({
    where: eq(campaigns.clinicId, clinicId),
    orderBy: [desc(campaigns.createdAt)],
    with: {
        logs: true // Include stats
    }
  });
  return c.json({ ok: true, data: list });
});

// POST /api/marketing/campaigns
app.post('/campaigns', zValidator('json', campaignSchema), async (c) => {
  const clinicId = c.get('clinicId');
  const userId = c.get('userId');
  const role = c.get('role');
  const { name, type, targetAudience, messageTemplate, sendNow } = c.req.valid('json');

  // 1. Permission Check
  if (role !== 'OWNER' && role !== 'MANAGER') {
      // Dentists can only send Recall campaigns
      if (!name.toLowerCase().includes('retorno') && !name.toLowerCase().includes('recall')) {
          throw new HTTPException(403, { message: 'Dentistas só podem criar campanhas de Retorno Clínico.' });
      }
  }

  // 2. Create Campaign Record
  const [newCampaign] = await db.insert(campaigns).values({
    clinicId,
    creatorId: userId,
    name,
    type,
    targetAudience,
    messageTemplate,
    status: sendNow ? 'SENT' : 'DRAFT',
    scheduledFor: sendNow ? new Date() : null,
  }).returning();

  // 3. Execution Logic (Simulation of WhatsApp API)
  if (sendNow) {
      let targetPatients: { id: string }[] = [];

      // Audience Logic
      if (targetAudience === 'ALL') {
          targetPatients = await db.select({ id: patients.id }).from(patients).where(eq(patients.clinicId, clinicId));
      } else if (targetAudience === 'INACTIVE_6_MONTHS') {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          // Assuming we have lastVisit data, simple filter
          targetPatients = await db.select({ id: patients.id })
            .from(patients)
            .where(and(eq(patients.clinicId, clinicId), lte(patients.lastVisit, sixMonthsAgo)));
      }
      
      // Bulk Insert Logs (Simulating Queue)
      if (targetPatients.length > 0) {
          await db.insert(messageLogs).values(
              targetPatients.map(p => ({
                  campaignId: newCampaign.id,
                  patientId: p.id,
                  channel: type,
                  status: 'SENT', // Simulating instant success for demo
                  sentAt: new Date()
              }))
          );
      }
  }

  return c.json({ ok: true, data: newCampaign, message: sendNow ? 'Campanha enviada com sucesso!' : 'Campanha salva.' });
});

export default app;

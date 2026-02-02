import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { financial, patients, procedures } from '../db/schema';
import { and, desc, eq, inArray, or } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Variables: { organizationId: number } }>();
app.use('*', authMiddleware);

const tissSchema = z.object({
  patientId: z.coerce.number(),
  procedureIds: z.array(z.coerce.number()).min(1),
});

const invoiceSchema = z.object({
  amount: z.number().positive(),
  cpf: z.string().min(8),
});

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatTime = (date: Date) => date.toISOString().slice(11, 19);

const buildTissXml = (organizationId: number, patient: any, procs: any[]) => {
  const now = new Date();
  const guideNumber = `SP${now.getTime()}`;
  const patientName =
    patient?.name ||
    patient?.fullName ||
    [patient?.firstName, patient?.surname].filter(Boolean).join(' ') ||
    'Paciente';
  const patientCpf = patient?.cpf || '00000000000';

  const items = procs
    .map((proc: any, index: number) => {
      const code = proc?.tussCode || proc?.code || '0000000';
      const value = proc?.price ? Number(proc.price).toFixed(2) : '0.00';
      return `
        <ans:procedimentoExecutado>
          <ans:sequencialItem>${index + 1}</ans:sequencialItem>
          <ans:procedimento>
            <ans:codigoTabela>22</ans:codigoTabela>
            <ans:codigoProcedimento>${code}</ans:codigoProcedimento>
            <ans:descricaoProcedimento>${proc?.name || 'Procedimento'}</ans:descricaoProcedimento>
          </ans:procedimento>
          <ans:quantidadeExecutada>1</ans:quantidadeExecutada>
          <ans:valorUnitario>${value}</ans:valorUnitario>
        </ans:procedimentoExecutado>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>ENVIO_LOTE_GUIAS</ans:tipoTransacao>
      <ans:sequencialTransacao>${now.getTime()}</ans:sequencialTransacao>
      <ans:dataRegistroTransacao>${formatDate(now)}</ans:dataRegistroTransacao>
      <ans:horaRegistroTransacao>${formatTime(now)}</ans:horaRegistroTransacao>
    </ans:identificacaoTransacao>
    <ans:origem>
      <ans:identificacaoPrestador>
        <ans:codigoPrestadorNaOperadora>${organizationId}</ans:codigoPrestadorNaOperadora>
      </ans:identificacaoPrestador>
    </ans:origem>
    <ans:destino>
      <ans:registroANS>000000</ans:registroANS>
    </ans:destino>
    <ans:versaoPadrao>3.05.00</ans:versaoPadrao>
  </ans:cabecalho>
  <ans:prestadorParaOperadora>
    <ans:loteGuias>
      <ans:numeroLote>${now.getTime()}</ans:numeroLote>
      <ans:guiasTISS>
        <ans:guiaSP-SADT>
          <ans:cabecalhoGuia>
            <ans:registroANS>000000</ans:registroANS>
            <ans:numeroGuiaPrestador>${guideNumber}</ans:numeroGuiaPrestador>
          </ans:cabecalhoGuia>
          <ans:dadosBeneficiario>
            <ans:numeroCarteira>${patientCpf}</ans:numeroCarteira>
            <ans:nomeBeneficiario>${patientName}</ans:nomeBeneficiario>
          </ans:dadosBeneficiario>
          <ans:procedimentosExecutados>
            ${items}
          </ans:procedimentosExecutados>
        </ans:guiaSP-SADT>
      </ans:guiasTISS>
    </ans:loteGuias>
  </ans:prestadorParaOperadora>
</ans:mensagemTISS>`;
};

app.post('/tiss/xml', zValidator('json', tissSchema), async (c) => {
  const organizationId = c.get('organizationId');
  const { patientId, procedureIds } = c.req.valid('json');

  const patient = await db.query.patients.findFirst({
    where: and(eq(patients.id, patientId), eq(patients.organizationId, organizationId)),
  });

  if (!patient) {
    return c.json({ ok: false, error: 'Paciente nao encontrado' }, 404);
  }

  const procList = await db.query.procedures.findMany({
    where: and(eq(procedures.organizationId, organizationId), inArray(procedures.id, procedureIds)),
  });

  const xml = buildTissXml(organizationId, patient, procList);
  return c.text(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' });
});

app.post('/invoice', zValidator('json', invoiceSchema), async (c) => {
  const organizationId = c.get('organizationId');
  const { amount, cpf } = c.req.valid('json');
  const cpfDigits = cpf.replace(/\D/g, '');

  const patient = await db.query.patients.findFirst({
    where: and(
      eq(patients.organizationId, organizationId),
      or(eq(patients.cpf, cpfDigits), eq(patients.cpf, cpf))
    ),
  });

  if (!patient) {
    return c.json({ ok: false, error: 'Paciente nao encontrado' }, 404);
  }

  const entry = await db.query.financial.findFirst({
    where: and(eq(financial.organizationId, organizationId), eq(financial.patientId, patient.id)),
    orderBy: [desc(financial.dueDate)],
  });

  if (!entry) {
    return c.json({ ok: false, error: 'Nenhuma cobranca encontrada' }, 404);
  }

  const [updated] = await db.update(financial)
    .set({ status: 'INVOICED' })
    .where(eq(financial.id, entry.id))
    .returning();

  const invoiceUrl = `https://nfe.dentis.app/invoices/${updated?.id || entry.id}.pdf`;

  return c.json({
    ok: true,
    data: {
      status: updated?.status || 'INVOICED',
      invoiceUrl,
      amount,
      patientId: patient.id,
    },
  });
});

export default app;

import { Router } from 'express';
import { db } from '../db';
import { patients } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '../middleware/auth';

const router = Router();

// LISTAR: Apenas pacientes DA CLÍNICA ativa do usuário
router.get("/", requireRole(['dentist', 'admin']), async (req: any, res) => {
  const allPatients = await db.query.patients.findMany({
    where: and(
      eq(patients.clinicId, req.clinicId), // FILTRO CRÍTICO DE ISOLAMENTO
      eq(patients.active, true)
    )
  });
  res.json({ patients: allPatients });
});

export default router;
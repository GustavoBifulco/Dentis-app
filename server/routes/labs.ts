import { Router } from 'express';
import { db } from '../db';
import { labOrders } from '../db/schema_lab';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '../middleware/auth';

const router = Router();

// LISTAR Pedidos (Filtrado por Clínica)
router.get("/", requireRole(['dentist', 'admin']), async (req: any, res) => {
  try {
    const orders = await db.select().from(labOrders)
      .where(eq(labOrders.clinicId, req.clinicId));
    
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});

// CRIAR Novo Pedido
router.post("/", requireRole(['dentist']), async (req: any, res) => {
  try {
    const { patientName, procedure, deadline, labName, cost } = req.body;
    
    await db.insert(labOrders).values({
      clinicId: req.clinicId, // Injeção automática segura
      patientName,
      procedure,
      labName,
      deadline: new Date(deadline),
      cost: cost ? String(cost) : '0',
      status: 'requested'
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar pedido" });
  }
});

// ATUALIZAR Status
router.patch("/:id/status", requireRole(['dentist', 'admin']), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.update(labOrders)
      .set({ status })
      .where(and(
        eq(labOrders.id, Number(id)),
        eq(labOrders.clinicId, req.clinicId) // Garante que só altera da própria clínica
      ));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

export default router;
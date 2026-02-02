import os

def activate_lab_backend():
    # 1. Atualizar SCHEMA do Banco de Dados
    # Como o arquivo schema.ts original está "desativado", vamos criar um novo focado no Lab
    if not os.path.exists("server/db"):
        os.makedirs("server/db")

    schema_content = """
import { pgTable, serial, text, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core';

export const labOrders = pgTable('lab_orders', {
  id: serial('id').primaryKey(),
  clinicId: text('clinic_id').notNull(),
  patientName: text('patient_name').notNull(),
  procedure: text('procedure').notNull(),
  labName: text('lab_name'),
  status: text('status', { enum: ['requested', 'production', 'ready', 'delivered'] }).default('requested'),
  deadline: timestamp('deadline').notNull(),
  cost: decimal('cost', { precision: 10, scale: 2 }).default('0'),
  isDigital: boolean('is_digital').default(false),
  stlFileUrl: text('stl_file_url'),
  createdAt: timestamp('created_at').defaultNow()
});
"""
    with open("server/db/schema_lab.ts", "w", encoding="utf-8") as f:
        f.write(schema_content.strip())
    print("✅ Schema de Laboratório criado em server/db/schema_lab.ts")

    # 2. Criar a Rota API (Backend)
    # Esta rota vai receber as chamadas do useLabs.ts
    if not os.path.exists("server/routes"):
        os.makedirs("server/routes")

    route_content = """
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
"""
    with open("server/routes/labs.ts", "w", encoding="utf-8") as f:
        f.write(route_content.strip())
    print("✅ Rota API de Laboratório criada em server/routes/labs.ts")

if __name__ == "__main__":
    activate_lab_backend()
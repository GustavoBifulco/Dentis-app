import { Hono } from 'hono';
import { db } from '../db';
import { labOrders } from '../db/schema_lab';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '../middleware/auth';

const app = new Hono();

// LISTAR Pedidos (Filtrado por Clínica)
app.get("/", requireRole(['dentist', 'admin']), async (c) => {
  try {
    const user = c.get('user');
    if (!user || !user.organizationId) {
      return c.json({ error: 'Clinic context not found' }, 400);
    }

    const orders = await db.select().from(labOrders)
      .where(eq(labOrders.organizationId, user.organizationId));

    return c.json({ orders });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Erro ao buscar pedidos" }, 500);
  }
});

// CRIAR Novo Pedido
app.post("/", requireRole(['dentist']), async (c) => {
  try {
    const user = c.get('user');
    if (!user || !user.organizationId) {
      return c.json({ error: 'Clinic context not found' }, 400);
    }

    const { patientName, procedure, deadline, labName, cost } = await c.req.json();

    await db.insert(labOrders).values({
      organizationId: user.organizationId, // Injeção automática segura
      patientName,
      procedure,
      labName,
      deadline: new Date(deadline),
      cost: cost ? String(cost) : '0',
      status: 'requested'
    });

    return c.json({ success: true });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Erro ao criar pedido" }, 500);
  }
});

// ATUALIZAR Status
app.patch("/:id/status", requireRole(['dentist', 'admin']), async (c) => {
  try {
    const user = c.get('user');
    if (!user || !user.organizationId) {
      return c.json({ error: 'Clinic context not found' }, 400);
    }

    const id = c.req.param('id');
    const { status } = await c.req.json();

    await db.update(labOrders)
      .set({ status })
      .where(and(
        eq(labOrders.id, Number(id)),
        eq(labOrders.organizationId, user.organizationId) // Garante que só altera da própria clínica
      ));

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Erro ao atualizar status" }, 500);
  }
});

export default app;
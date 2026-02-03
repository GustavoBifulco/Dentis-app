import { Hono } from 'hono';
import { inventory } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { seedDefaultData } from '../services/seedData';
import { authMiddleware } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const app = new Hono();

app.use('*', authMiddleware);

app.get('/', async (c) => {
  const auth = c.get('auth');
  const scoped = scopedDb(c);

  let list = await scoped.select(inventory);

  // SEED ON READ: Se vazio, popula e busca de novo
  if (list.length === 0 && auth.organizationId) {
    console.log(`Inventory empty for ${auth.organizationId}. Triggering Seed-On-Read.`);
    try {
      await seedDefaultData(auth.organizationId);
      list = await scoped.select(inventory);
    } catch (e) {
      console.error("Seed-On-Read failed:", e);
    }
  }

  return c.json(list);
});

// Implementar POST se necessário para funcionamento básico, mas o GET já resolve o seed.
app.post('/', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();
  const scoped = scopedDb(c);

  // Validar unit e name
  const [newItem] = await scoped.insert(inventory).values({
    organizationId: auth.organizationId,
    name: body.name,
    quantity: body.quantity || 0,
    unit: body.unit || 'un',
  }).returning();

  return c.json(newItem, 201);
});

// UPDATE - Edit inventory item
app.put('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));
  const body = await c.req.json();
  const scoped = scopedDb(c);

  if (!id || isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  try {
    const [updated] = await scoped
      .update(inventory)
      .set({
        name: body.name,
        category: body.category,
        unit: body.unit,
        price: body.price,
        supplier: body.supplier,
        link: body.link,
        minStock: body.minStock,
        currentStock: body.currentStock,
      })
      .where(eq(inventory.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: 'Item not found' }, 404);
    }

    return c.json(updated);
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

// DELETE - Remove inventory item
app.delete('/:id', async (c) => {
  const auth = c.get('auth');
  const id = parseInt(c.req.param('id'));
  const scoped = scopedDb(c);

  if (!id || isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  try {
    const [deleted] = await scoped
      .delete(inventory)
      .where(eq(inventory.id, id))
      .returning();

    if (!deleted) {
      return c.json({ error: 'Item not found' }, 404);
    }

    return c.json({ success: true, message: 'Item deleted' });
  } catch (error: any) {
    console.error('Error deleting inventory item:', error);
    return c.json({ error: 'Failed to delete item' }, 500);
  }
});

export default app;

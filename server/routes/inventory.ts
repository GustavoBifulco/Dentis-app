import { Hono } from 'hono';
import { inventory, inventoryBatches, inventoryMovements } from '../db/schema';
import { scopedDb } from '../db/scoped';
import { seedDefaultData } from '../services/seedData';
import { authMiddleware } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';
import { logTimelineEvent } from '../services/timeline';
import { db } from '../db';

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
        minQuantity: body.minQuantity || body.minStock || 0, // Fallback p/ compatibilidade
        quantity: body.quantity || body.currentStock || 0,
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

// --- W2.3 BATCHES & MOVEMENTS ---

// GET /api/inventory/batches/:itemId
app.get('/batches/:itemId', async (c) => {
  const auth = c.get('auth');
  const itemId = Number(c.req.param('itemId'));

  const batches = await db.select().from(inventoryBatches)
    .where(and(eq(inventoryBatches.itemId, itemId), eq(inventoryBatches.organizationId, auth.organizationId)))
    .orderBy(desc(inventoryBatches.expiryDate));

  return c.json(batches);
});

// POST /api/inventory/movements (IN/OUT)
app.post('/movements', async (c) => {
  const auth = c.get('auth'); // Auth middleware sets this
  const user = c.get('user'); // Auth middleware sets this too usually (check middleware)
  // authMiddleware in 'middleware/auth.ts' usually sets c.set('user', ...) and c.set('auth', { userId, organizationId })
  // In this file, it uses c.get('auth').

  // User ID fallback
  const userId = user?.id || auth.userId;

  const body = await c.req.json();
  /*
    body: {
      itemId: number,
      type: 'in' | 'out' | 'adjust',
      quantity: number,
      batchNumber?: string,
      expiryDate?: string,
      refType?: string,
      refId?: string
    }
  */

  // 1. Transaction? Ideal, but for now linear.
  // 2. Handle Batch
  let batchId = body.batchId;

  if (body.type === 'in' && body.batchNumber) {
    // Create or find batch
    const existingInfo = await db.select().from(inventoryBatches).where(and(
      eq(inventoryBatches.itemId, body.itemId),
      eq(inventoryBatches.batchNumber, body.batchNumber),
      eq(inventoryBatches.organizationId, auth.organizationId)
    )).limit(1);

    if (existingInfo.length > 0) {
      batchId = existingInfo[0].id;
      // Update quantity
      await db.update(inventoryBatches)
        .set({ quantity: existingInfo[0].quantity! + body.quantity })
        .where(eq(inventoryBatches.id, batchId));
    } else {
      const [newBatch] = await db.insert(inventoryBatches).values({
        organizationId: auth.organizationId,
        itemId: body.itemId,
        batchNumber: body.batchNumber,
        expiryDate: new Date(body.expiryDate),
        quantity: body.quantity,
        location: body.location
      }).returning();
      batchId = newBatch.id;
    }
  } else if (body.type === 'out' && body.batchId) {
    // Deduct from batch
    const batch = await db.select().from(inventoryBatches).where(eq(inventoryBatches.id, body.batchId)).limit(1);
    if (batch.length) {
      await db.update(inventoryBatches)
        .set({ quantity: Math.max(0, batch[0].quantity! - body.quantity) })
        .where(eq(inventoryBatches.id, body.batchId));
    }
  }

  // 3. Update Main Inventory (Reference)
  const item = await db.select().from(inventory).where(eq(inventory.id, body.itemId)).limit(1);
  if (item.length) {
    const change = body.type === 'in' ? body.quantity : -body.quantity;
    await db.update(inventory)
      .set({ quantity: (item[0].quantity || 0) + change })
      .where(eq(inventory.id, body.itemId));
  }

  // 4. Log Movement
  const [movement] = await db.insert(inventoryMovements).values({
    organizationId: auth.organizationId,
    itemId: body.itemId,
    batchId: batchId || null,
    type: body.type,
    quantity: body.quantity,
    refType: body.refType,
    refId: body.refId,
    createdBy: userId
  }).returning();

  // 5. Timeline Event (Major movements)
  if (body.type === 'in' || body.quantity > 10) { // Threshold for noise?
    logTimelineEvent({
      organizationId: auth.organizationId,
      eventType: 'logistic', // or 'system'
      // Actually reusing 'shipment' or generic.
      // Let's use 'alert' as stock alert? Or 'document'? 
      // I'll skip timeline for now to avoid RefType error until I add 'inventory' to types.
      // Or use 'system' eventType with 'alert' refType.
      refType: 'alert',
      refId: String(movement.id),
      title: `Estoque: ${body.type === 'in' ? 'Entrada' : 'Saída'} - ${item[0]?.name}`,
      summary: `${body.quantity} un. (Lote: ${body.batchNumber || 'N/A'})`,
      createdBy: userId
    });
  }

  return c.json(movement);
});

export default app;

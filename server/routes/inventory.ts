import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

/**
 * LEGACY INVENTORY ROUTE - TEMPORARILY DISABLED
 * 
 * The inventory table has been removed from the schema.
 * This route needs to be reimplemented or removed completely.
 * 
 * TODO: Decide if inventory functionality is still needed
 */

const inventory = new Hono<{ Variables: { userId: string } }>();

inventory.use('*', authMiddleware);

inventory.get('/', async (c) => {
  return c.json({
    error: 'Inventory module temporarily disabled',
    message: 'This feature is being migrated to the new schema',
  }, 501);
});

inventory.post('/', async (c) => {
  return c.json({
    error: 'Inventory module temporarily disabled',
    message: 'This feature is being migrated to the new schema',
  }, 501);
});

inventory.patch('/:id', async (c) => {
  return c.json({
    error: 'Inventory module temporarily disabled',
    message: 'This feature is being migrated to the new schema',
  }, 501);
});

inventory.delete('/:id', async (c) => {
  return c.json({
    error: 'Inventory module temporarily disabled',
    message: 'This feature is being migrated to the new schema',
  }, 501);
});

export default inventory;

import { z } from 'zod';
import { Context, Next } from 'hono';

// Validação Genérica com Zod para evitar SQL Injection e dados sujos
export const validate = (schema: z.AnyZodObject) => {
  return async (c: Context, next: Next) => {
    try {
      const body = ['POST', 'PUT', 'PATCH'].includes(c.req.method) ? await c.req.json().catch(() => ({})) : {};

      await schema.parseAsync({
        body,
        query: c.req.query(),
        params: c.req.param(),
      });
      await next();
    } catch (error) {
      return c.json(error, 400);
    }
  };
};
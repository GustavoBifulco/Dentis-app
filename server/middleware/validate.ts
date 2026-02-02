import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Validação Genérica com Zod para evitar SQL Injection e dados sujos
export const validate = (schema: z.AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };
};
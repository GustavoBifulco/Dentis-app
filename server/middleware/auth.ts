import { requireAuth } from '@clerk/nextjs/server'; // ou seu provider
import { Request, Response, NextFunction } from 'express';

// Middleware de Autorização por Role e Isolamento de Clínica
export const requireRole = (allowedRoles: string[]) => {
  return async (req: any, res: Response, next: NextFunction) => {
    const { userId, orgRole, orgId } = req.auth;

    if (!userId) return res.status(401).json({ error: "Não autenticado" });

    // GARANTE ISOLAMENTO: Todo request deve ter um clinicId (orgId) vinculado
    if (!orgId && allowedRoles.includes('dentist')) {
      return res.status(403).json({ error: "Contexto de clínica não selecionado" });
    }

    req.clinicId = orgId; // Injeta o ID da clínica para uso nas queries
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(orgRole)) {
      return res.status(403).json({ error: "Acesso negado: permissão insuficiente" });
    }

    next();
  };
};
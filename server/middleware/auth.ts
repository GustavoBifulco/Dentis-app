import { getAuth } from '@clerk/clerk-sdk-node';

export const authMiddleware = async (c: any, next: any) => {
  // Aceita o ID vindo do Clerk OU do Header que configuramos acima
  const auth = getAuth(c.env);
  const userId = auth?.userId || c.req.header('x-user-id');

  if (!userId) {
    console.error("❌ Acesso negado: Sem userId");
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', userId);
  await next();
};

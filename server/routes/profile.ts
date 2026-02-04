// Imports existentes (ajuste conforme seu arquivo)
import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireMfa } from '../middleware/auth';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { getUserPermissions } from '../utils/rbac';

const app = new Hono();

app.get('/me', requireMfa, async (c) => {
  const auth = c.get('auth');
  if (!auth?.userId) return c.json({ error: 'Não autenticado' }, 401);

  const clerkUser = await clerkClient.users.getUser(auth.userId);

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, auth.userId));

  if (!dbUser) return c.json({ error: 'Usuário não encontrado no banco' }, 404);

  // Cast profileData for safer access
  const profile = (dbUser.profileData || {}) as Record<string, any>;

  // Get Granular Permissions
  const permissions = await getUserPermissions(dbUser.id, dbUser.organizationId || 'org-1'); // Fallback if no org?

  return c.json({
    id: dbUser.id,
    clerkId: dbUser.clerkId,
    role: dbUser.role,
    permissions: permissions, // <-- NEW
    organizationId: dbUser.organizationId,
    name: dbUser.name || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
    email: dbUser.email || clerkUser.primaryEmailAddress?.emailAddress,
    cpf: dbUser.cpf || profile.cpf || '',
    phone: profile.phone || clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
    birthDate: profile.birthDate || '',
    address: profile.address || { street: '', number: '', neighborhood: '', city: '', state: '' },
    companyName: profile.companyName || '',
    cnpj: profile.cnpj || '',
    technicalManager: profile.technicalManager || '',
    lastName: clerkUser.lastName || '',
  });
});

export default app;

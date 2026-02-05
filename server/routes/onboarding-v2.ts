
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
import { db } from '../db';
import { users, professionalProfiles, patientProfiles, organizations, organizationMembers } from '../db/schema';
import { seedDefaultData } from '../services/seedData';
import { eq } from 'drizzle-orm';

const onboardingV2 = new Hono();

// Schema de validação
const quickSetupSchema = z.object({
    userId: z.string(), // Clerk ID
    role: z.enum(['dentist', 'clinic_owner', 'patient']),
    name: z.string(),
    cpf: z.string(),
    phone: z.string(),
    cro: z.string().optional().or(z.literal('')), // Aceita string vazia ou qualquer string para evitar bloqueio
    clinicName: z.string().optional(),
});

// Rota principal para setup rápido
onboardingV2.post('/quick-setup', zValidator('json', quickSetupSchema), async (c) => {
    const data = c.req.valid('json');
    console.log('🚀 [ONBOARDING V2] Iniciando setup:', { role: data.role, name: data.name });

    try {
        // Usa transação para garantir integridade
        const result = await db.transaction(async (tx) => {
            // 1. Criar ou atualizar User base
            // Verifica se já existe pelo Clerk ID
            const existingUser = await tx.query.users.findFirst({
                where: eq(users.clerkId, data.userId),
            });

            if (existingUser) {
                console.log('User já existe, ignorando criação');
                // Retornar dados existentes
                return { userId: existingUser.id, existing: true };
            }

            const [userRecord] = await tx
                .insert(users)
                .values({
                    clerkId: data.userId,
                    role: data.role,
                    name: data.name,
                    cpf: data.cpf.replace(/\D/g, ''),
                    phone: data.phone.replace(/\D/g, ''),
                    // onboardingComplete: new Date(), // Campo removido do schema users em alguns contextos, mantenha se tiver certeza
                })
                .returning();

            console.log(`✅ User criado/atualizado: ID ${userRecord.id}`);

            // 2. Sempre criar patient profile (todos têm acesso ao portal pessoal)
            await tx
                .insert(patientProfiles)
                .values({
                    userId: userRecord.id.toString(),
                })
                .onConflictDoNothing();

            // 3. Se profissional, criar professional profile
            if (data.role === 'dentist' || data.role === 'clinic_owner') {
                await tx
                    .insert(professionalProfiles)
                    .values({
                        userId: userRecord.id.toString(),
                        type: data.role.toUpperCase(),
                        cro: data.cro?.trim() || null,
                    })
                    .onConflictDoNothing();

                console.log(`✅ Professional profile criado`);
            }

            // 4. Se clinic owner, criar organização
            let orgId: string | null = null;
            if (data.role === 'clinic_owner' && data.clinicName) {
                // Criar org no Clerk primeiro para ter o ID
                try {
                    const clerkOrg = await clerkClient.organizations.createOrganization({
                        name: data.clinicName,
                        createdBy: data.userId,
                    });
                    orgId = clerkOrg.id;

                    // Criar no DB
                    const [org] = await tx
                        .insert(organizations)
                        .values({
                            id: clerkOrg.id, // Correção: usar id em vez de clerkOrgId
                            name: data.clinicName,
                        })
                        .returning();

                    // Adicionar como membro admin
                    await tx.insert(organizationMembers).values({
                        userId: userRecord.id.toString(),
                        organizationId: org.id,
                        role: 'ADMIN',
                    });

                    console.log(`✅ Organização criada: ${clerkOrg.id}`);
                } catch (orgErr: any) {
                    console.error('⚠️ Erro ao criar organização:', orgErr);
                    // Não falha a transação por causa disso
                }
            }

            let seedOrgId = orgId;
            let shouldSeed = !!orgId;

            // Para dentistas autônomos, criamos um workpsace pessoal isolado
            if (data.role === 'dentist' && !orgId) {
                const personalOrgId = `personal-${data.userId}`;
                seedOrgId = personalOrgId;
                shouldSeed = true;

                // Criar organização pessoal no banco
                await tx.insert(organizations).values({
                    id: personalOrgId,
                    name: `Consultório - ${data.name}`,
                    // slug: `consultorio-${data.userId}` // Se existir slug no schema, descomentar e adicionar
                }).onConflictDoNothing();

                // Adicionar membro
                await tx.insert(organizationMembers).values({
                    userId: userRecord.id.toString(),
                    organizationId: personalOrgId,
                    role: 'ADMIN',
                });

                console.log(`✅ Personal Workspace criado para dentista: ${personalOrgId}`);
            }

            return {
                userId: userRecord.id, // Number
                clerkId: userRecord.clerkId,
                role: data.role,
                orgId,
                seedOrgId,
                shouldSeed,
            };
        });

        // Executar seed fora da transação
        if ((result as any).shouldSeed && (result as any).seedOrgId) {
            // Não dar await para não travar a resposta
            seedDefaultData((result as any).seedOrgId).then(() => {
                console.log(`🌱 Seed process started for org ${(result as any).seedOrgId}`);
            });
        }

        // Determina se precisa de pagamento (lógica simplificada)
        const needsPayment = data.role !== 'patient';

        // Se for paciente, já marca como completo no Clerk
        if (data.role === 'patient') {
            await clerkClient.users.updateUser(data.userId, {
                publicMetadata: {
                    onboardingComplete: true,
                    role: data.role,
                    dbUserId: result.userId,
                },
            });
            console.log(`✅ Clerk atualizado para paciente`);
        }

        return c.json({
            success: true,
            userId: result.userId,
            needsPayment,
            message: 'Dados salvos com sucesso!',
        });
    } catch (error: any) {
        console.error('❌ [ONBOARDING V2] Erro:', error);
        return c.json(
            {
                success: false,
                error: error.message || 'Erro ao salvar dados',
            },
            500
        );
    }
});

/**
 * Marca onboarding como completo no Clerk
 */
onboardingV2.post('/mark-complete', async (c) => {
    const { userId, dbUserId } = await c.req.json();

    try {
        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                onboardingComplete: true,
                dbUserId: dbUserId, // Salva o ID do nosso DB no Clerk
            },
        });

        return c.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao atualizar metadata no Clerk:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
});

export default onboardingV2;

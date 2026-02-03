import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '../db';
import { users, professionalProfiles, patientProfiles, organizations, organizationMembers } from '../db/schema';
import { seedDefaultData } from '../services/seedData';
import { eq } from 'drizzle-orm';

const onboardingV2 = new Hono();

const quickSetupSchema = z.object({
    userId: z.string(), // Clerk ID
    role: z.enum(['dentist', 'clinic_owner', 'patient']),
    name: z.string(),
    cpf: z.string(),
    phone: z.string(),
    cro: z.string().optional(),
    clinicName: z.string().optional(),
});

/**
 * Nova rota de onboarding simplificada
 * Salva TUDO no DB imediatamente em uma transação atômica
 * Não toca no Clerk ainda (isso será feito depois ou via webhook)
 */
onboardingV2.post('/quick-setup', zValidator('json', quickSetupSchema), async (c) => {
    const data = c.req.valid('json');

    console.log(`🚀 [ONBOARDING V2] Quick setup para ${data.userId} (${data.role})`);

    try {
        // Transação atômica - tudo ou nada
        const result = await db.transaction(async (tx) => {
            // 1. Upsert User
            const [userRecord] = await tx
                .insert(users)
                .values({
                    clerkId: data.userId,
                    role: data.role,
                    name: data.name,
                    cpf: data.cpf.replace(/\D/g, ''),
                    phone: data.phone.replace(/\D/g, ''),
                    email: null, // Será preenchido depois se necessário
                    onboardingComplete: new Date(),
                })
                .onConflictDoUpdate({
                    target: users.clerkId,
                    set: {
                        role: data.role,
                        name: data.name,
                        cpf: data.cpf.replace(/\D/g, ''),
                        phone: data.phone.replace(/\D/g, ''),
                        onboardingComplete: new Date(),
                    },
                })
                .returning();

            console.log(`✅ User criado/atualizado: ID ${userRecord.id}`);

            // 2. Sempre criar patient profile (todos têm acesso ao portal pessoal)
            await tx
                .insert(patientProfiles)
                .values({
                    userId: userRecord.id,
                })
                .onConflictDoNothing();

            // 3. Se profissional, criar professional profile
            if (data.role === 'dentist' || data.role === 'clinic_owner') {
                await tx
                    .insert(professionalProfiles)
                    .values({
                        userId: userRecord.id,
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
                            clerkOrgId: clerkOrg.id,
                            name: data.clinicName,
                        })
                        .returning();

                    // Adicionar como membro admin
                    await tx.insert(organizationMembers).values({
                        userId: userRecord.id,
                        organizationId: org.id,
                        role: 'ADMIN',
                    });

                    // Vincular user à organização diretamente para facilitar Auth
                    await tx.update(users)
                        .set({ organizationId: clerkOrg.id })
                        .where(eq(users.id, userRecord.id));

                    console.log(`✅ Organização criada: ${clerkOrg.id}`);
                } catch (orgErr: any) {
                    console.error('⚠️ Erro ao criar organização:', orgErr);
                    // Não falha a transação por causa disso
                }
            }

            let seedOrgId = orgId;
            let shouldSeed = !!orgId;

            // Para dentistas autônomos, criamos um workpsace pessoal isolado
            // Assim eles não compartilham dados com outros dentistas (privacidade)
            // E o sistema seeda os dados neste workspace pessoal
            if (data.role === 'dentist' && !orgId) {
                const personalOrgId = `personal-${data.userId}`;
                seedOrgId = personalOrgId;
                shouldSeed = true;

                // Salvar o workspace pessoal no usuário
                // Isso garante que o Auth Middleware pegue o contexto correto
                await tx.update(users)
                    .set({ organizationId: personalOrgId })
                    .where(eq(users.id, userRecord.id));

                console.log(`✅ Personal Workspace criado para dentista: ${personalOrgId}`);
            }

            return {
                userId: userRecord.id,
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


        // Determina se precisa de pagamento
        const needsPayment = data.role !== 'patient'; // Pacientes não pagam
        const isFree = false; // Será determinado no frontend quando escolher plano

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
 * Chamado quando usuário escolhe plano FREE ou após webhook do Stripe
 */
onboardingV2.post('/mark-complete', async (c) => {
    const { userId, dbUserId } = await c.req.json();

    if (!userId) {
        return c.json({ error: 'userId required' }, 400);
    }

    try {
        // Busca role do DB
        const [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

        if (!user) {
            return c.json({ error: 'User not found in DB' }, 404);
        }

        await clerkClient.users.updateUser(userId, {
            publicMetadata: {
                onboardingComplete: true,
                role: user.role,
                dbUserId: user.id,
            },
        });

        console.log(`✅ Onboarding marcado como completo para ${userId}`);

        return c.json({ success: true });
    } catch (error: any) {
        console.error('❌ Erro ao marcar complete:', error);
        return c.json({ error: error.message }, 500);
    }
});

export default onboardingV2;

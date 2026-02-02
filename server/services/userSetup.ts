import { db } from '../db';
import { users, inventory, procedures, clinics, clinicMembers } from '../db/schema';
import { eq } from 'drizzle-orm';

const seedDefaultData = async (clinicId: number, userId: number) => {
    // 5. Inserir Itens de Inventário Padrão
    const rawInventoryItems = [
        { name: 'Luvas de Procedimento P', category: 'Descartáveis', quantity: 10, unit: 'Caixa', minLevel: 2, userId },
        { name: 'Luvas de Procedimento M', category: 'Descartáveis', quantity: 10, unit: 'Caixa', minLevel: 2, userId },
        { name: 'Luvas de Procedimento G', category: 'Descartáveis', quantity: 5, unit: 'Caixa', minLevel: 2, userId },
        { name: 'Máscaras Descartáveis', category: 'Descartáveis', quantity: 10, unit: 'Caixa', minLevel: 2, userId },
        { name: 'Sugadores Descartáveis', category: 'Descartáveis', quantity: 5, unit: 'Pacote', minLevel: 1, userId },
        { name: 'Babadores', category: 'Descartáveis', quantity: 5, unit: 'Pacote', minLevel: 1, userId },
        { name: 'Agulhas Gengivais Curtas', category: 'Anestesia', quantity: 5, unit: 'Caixa', minLevel: 1, userId },
        { name: 'Agulhas Gengivais Longas', category: 'Anestesia', quantity: 5, unit: 'Caixa', minLevel: 1, userId },
        { name: 'Anestésico Tópico', category: 'Anestesia', quantity: 2, unit: 'Frasco', minLevel: 1, userId },
        { name: 'Lidocaína 2% com Vaso', category: 'Anestesia', quantity: 5, unit: 'Caixa', minLevel: 1, userId },
        { name: 'Resina Composta A1', category: 'Restaurador', quantity: 3, unit: 'Seringa', minLevel: 1, userId },
        { name: 'Resina Composta A2', category: 'Restaurador', quantity: 3, unit: 'Seringa', minLevel: 1, userId },
        { name: 'Resina Composta A3', category: 'Restaurador', quantity: 3, unit: 'Seringa', minLevel: 1, userId },
        { name: 'Adesivo Dentinário', category: 'Restaurador', quantity: 2, unit: 'Frasco', minLevel: 1, userId },
        { name: 'Ácido Fosfórico 37%', category: 'Restaurador', quantity: 3, unit: 'Seringa', minLevel: 1, userId },
    ];

    await db.insert(inventory).values(rawInventoryItems.map(i => ({ ...i, clinicId })));

    // 6. Inserir Procedimentos Padrão
    const proceduresItems = [
        { name: 'Consulta Inicial / Avaliação', code: '001', price: '150.00', cost: '0.00', description: 'Avaliação clínica, anamnese e orientação/planejamento odontológico: Consulta Inicial / Avaliação.', duration: 30, category: 'Diagnóstico', userId },
        { name: 'Profilaxia (Limpeza)', code: '002', price: '200.00', cost: '0.00', description: 'Exame de imagem para avaliação e planejamento odontológico: Profilaxia (Limpeza).', duration: 45, category: 'Profilaxia & Periodontia', userId },
        { name: 'Restauração simples (1 face)', code: '003', price: '250.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Restauração simples (1 face).', duration: 45, category: 'Restaurador', userId },
        { name: 'Restauração composta (2 faces)', code: '004', price: '350.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Restauração composta (2 faces).', duration: 60, category: 'Restaurador', userId },
        { name: 'Restauração complexa (3+ faces)', code: '005', price: '450.00', cost: '0.00', description: 'Procedimento odontológico restaurador/dentística conforme indicação: Restauração complexa (3+ faces).', duration: 60, category: 'Restaurador', userId },
        { name: 'Exodontia simples', code: '006', price: '300.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia simples.', duration: 45, category: 'Cirurgia', userId },
        { name: 'Exodontia complexa (Siso)', code: '007', price: '500.00', cost: '0.00', description: 'Procedimento cirúrgico odontológico realizado conforme indicação e protocolo clínico: Exodontia complexa (Siso).', duration: 90, category: 'Cirurgia', userId },
        { name: 'Tratamento de Canal (Anterior)', code: '008', price: '600.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Tratamento de Canal (Anterior).', duration: 90, category: 'Endodontia', userId },
        { name: 'Tratamento de Canal (Posterior)', code: '009', price: '900.00', cost: '0.00', description: 'Procedimento endodôntico realizado conforme indicação: Tratamento de Canal (Posterior).', duration: 120, category: 'Endodontia', userId },
        { name: 'Clareamento Consultório (Sessão)', code: '010', price: '500.00', cost: '0.00', description: 'Procedimento estético odontológico conforme indicação: Clareamento Consultório (Sessão).', duration: 60, category: 'Estética', userId },
        { name: 'Clareamento Caseiro (Kit)', code: '011', price: '800.00', cost: '0.00', description: 'Procedimento estético odontológico conforme indicação: Clareamento Caseiro (Kit).', duration: 30, category: 'Estética', userId },
    ];

    await db.insert(procedures).values(proceduresItems.map(i => ({ ...i, clinicId })));
    console.log('✅ Procedimentos padrão criados.');
}

export const setupNewUserEnvironment = async (
    clerkId: string,
    role: string,
    force: boolean = false,
    clerkOrgId?: string,
    clinicName?: string
) => {
    console.log('🏁 Iniciando setup do usuário:', clerkId, 'Role:', role, 'Org:', clerkOrgId);

    // 1. Ensure User exists
    let user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
    if (!user) {
        const [newUser] = await db.insert(users).values({
            clerkId,
            role,
            isActive: true,
            onboardingComplete: true
        }).returning();
        user = newUser;
    }

    // 2. Ensure Clinic exists and User is Member
    // Se for PACIENTE, não cria clínica nem associa como membro de clínica proprietária
    if (role === 'patient') {
        console.log('ℹ️ Usuário é paciente. Pulando criação de clínica.');
        return;
    }

    let clinicId: number;

    // Se temos um clerkOrgId, tentamos encontrar a clínica por ele primeiro
    let existingClinic;
    if (clerkOrgId) {
        existingClinic = await db.query.clinics.findFirst({ where: eq(clinics.clerkOrgId, clerkOrgId) });
    }

    if (existingClinic) {
        clinicId = existingClinic.id;

        // Garantir que o usuário é membro
        const isMember = await db.query.clinicMembers.findFirst({
            where: (cm, { and, eq }) => and(eq(cm.userId, user!.id), eq(cm.clinicId, clinicId))
        });

        if (!isMember) {
            await db.insert(clinicMembers).values({
                userId: user.id,
                clinicId,
                role: 'OWNER' // Ou herdar do Org se preferir
            });
        }
    } else {
        // Criar nova clínica
        const name = clinicName || (role === 'clinic_owner' ? 'Minha Clínica' : `Consultório de ${user.name || clerkId}`);
        const [clinic] = await db.insert(clinics).values({
            name,
            clerkOrgId: clerkOrgId || null
        }).returning();
        clinicId = clinic.id;

        await db.insert(clinicMembers).values({
            userId: user.id,
            clinicId,
            role: 'OWNER'
        });
    }

    // 3. Seed Data (Opcional: evitar duplicados se force=false)
    const existingProcedures = await db.query.procedures.findFirst({ where: eq(procedures.clinicId, clinicId) });
    if (force || !existingProcedures) {
        await seedDefaultData(clinicId, user.id);
    }

    console.log('🎉 Setup do usuário concluído com sucesso!');
};

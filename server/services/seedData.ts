import { db } from '../db';
import { procedures, inventory, patients, templateProcedures, templateInventory } from '../db/schema';
import { eq } from 'drizzle-orm';

export const seedDefaultData = async (organizationId: string) => {
    console.log(`🌱 Seeding default data for organization ${organizationId}...`);

    try {
        // Check if data already exists to avoid duplication
        const existingProcedures = await db.select().from(procedures).where(eq(procedures.organizationId, organizationId)).limit(1);

        if (existingProcedures.length > 0) {
            console.log(`⚠️ Data already exists for org ${organizationId}, skipping seed.`);
            return { success: true, skipped: true };
        }

        // 1. Procedimentos via Template
        const tProcs = await db.select().from(templateProcedures);
        if (tProcs.length > 0) {
            const newProcedures = tProcs.map(t => ({
                name: t.name,
                description: t.description,
                price: t.price,
                organizationId,
            }));
            await db.insert(procedures).values(newProcedures);
            console.log(`✅ ${newProcedures.length} procedures copied from templates`);
        } else {
            console.log('⚠️ No template procedures found');
        }

        // 2. Estoque via Template
        const tInv = await db.select().from(templateInventory);

        if (tInv.length > 0) {
            const newInventory = tInv.map(t => ({
                name: t.name,
                category: t.category,
                quantity: t.quantity,
                minQuantity: t.minQuantity,
                unit: t.unit,
                price: t.price,
                supplier: t.supplier,
                link: t.link,
                organizationId,
            }));
            await db.insert(inventory).values(newInventory);
            console.log(`✅ ${newInventory.length} inventory items copied from templates`);
        } else {
            console.log('⚠️ No template inventory found');
        }

        // 3. Pacientes de Exemplo
        const defaultPatients = [
            {
                name: 'Maria Silva (Exemplo)',
                phone: '11999999999',
                cpf: '12345678900',
                email: 'maria.exemplo@email.com',
                organizationId,
                createdAt: new Date(),
            },
            {
                name: 'João Santos (Exemplo)',
                phone: '11888888888',
                cpf: '98765432100',
                email: 'joao.exemplo@email.com',
                organizationId,
                createdAt: new Date(),
            }
        ];

        await db.insert(patients).values(defaultPatients);
        console.log('✅ Default patients created');

        return { success: true };
    } catch (error) {
        console.error('❌ Error seeding default data:', error);
        // Não lança erro para não bloquear o onboarding se o seed falhar
        return { success: false, error };
    }
};

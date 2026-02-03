import { db } from '../db';
import { procedures, inventory } from '../db/schema';

export const seedDefaultData = async (organizationId: string) => {
    console.log(`🌱 Seeding default data for organization ${organizationId}...`);

    try {
        // 1. Procedimentos Padrão
        const defaultProcedures = [
            {
                name: 'Consulta Inicial / Avaliação',
                description: 'Avaliação clínica completa para planejamento do tratamento.',
                price: '150.00',
                organizationId,
            },
            {
                name: 'Profilaxia (Limpeza)',
                description: 'Remoção de placa bacteriana e tártaro + polimento coronário.',
                price: '250.00',
                organizationId,
            },
            {
                name: 'Restauração em Resina (1 face)',
                description: 'Restauração estética em dente posterior ou anterior.',
                price: '300.00',
                organizationId,
            },
            {
                name: 'Extração Simples',
                description: 'Exodontia de dente permanente erupcionado.',
                price: '400.00',
                organizationId,
            },
            {
                name: 'Clareamento Consultório',
                description: 'Sessão de clareamento com gel de alta concentração.',
                price: '800.00',
                organizationId,
            },
        ];

        await db.insert(procedures).values(defaultProcedures);
        console.log('✅ Default procedures created');

        // 2. Estoque Padrão (Materiais Básicos)
        const defaultInventory = [
            {
                name: 'Luvas de Procedimento P',
                quantity: 5,
                unit: 'caixa',
                organizationId,
            },
            {
                name: 'Luvas de Procedimento M',
                quantity: 5,
                unit: 'caixa',
                organizationId,
            },
            {
                name: 'Máscaras Descartáveis',
                quantity: 10,
                unit: 'caixa',
                organizationId,
            },
            {
                name: 'Anestésico Lidocaína',
                quantity: 20,
                unit: 'ampola',
                organizationId,
            },
            {
                name: 'Gaze Estéril',
                quantity: 50,
                unit: 'pacote',
                organizationId,
            },
            {
                name: 'Kit Resina Composta (A1, A2, A3)',
                quantity: 1,
                unit: 'kit',
                organizationId,
            },
            {
                name: 'Sugadores Descartáveis',
                quantity: 2,
                unit: 'pacote',
                organizationId,
            },
        ];

        await db.insert(inventory).values(defaultInventory);
        console.log('✅ Default inventory created');

        return { success: true };
    } catch (error) {
        console.error('❌ Error seeding default data:', error);
        // Não lança erro para não bloquear o onboarding se o seed falhar
        return { success: false, error };
    }
};

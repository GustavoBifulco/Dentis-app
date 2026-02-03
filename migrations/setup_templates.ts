import 'dotenv/config';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

const setupTemplates = async () => {
    console.log('🔄 Setting up template tables...');

    try {
        // Drop logic omitted to preserve data if tables exist (but we can drop if we want fresh templates)

        // 1. Template Procedures
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS template_procedures (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // Check if empty
        const procCount = await db.execute(sql`SELECT count(*) as count FROM template_procedures`);
        if (procCount[0].count === '0' || procCount[0].count === 0) {
            await db.execute(sql`
        INSERT INTO template_procedures (name, description, price) VALUES
        ('Consulta Inicial / Avaliação', 'Avaliação clínica completa para planejamento do tratamento.', '150.00'),
        ('Profilaxia (Limpeza)', 'Remoção de placa bacteriana e tártaro + polimento coronário.', '250.00'),
        ('Restauração em Resina (1 face)', 'Restauração estética em dente posterior ou anterior.', '300.00'),
        ('Extração Simples', 'Exodontia de dente permanente erupcionado.', '400.00'),
        ('Clareamento Consultório', 'Sessão de clareamento com gel de alta concentração.', '800.00');
        `);
            console.log('✅ Template procedures populated');
        }

        // 2. Template Inventory
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS template_inventory (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        unit TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        const invCount = await db.execute(sql`SELECT count(*) as count FROM template_inventory`);
        if (invCount[0].count === '0' || invCount[0].count === 0) {
            await db.execute(sql`
        INSERT INTO template_inventory (name, quantity, unit) VALUES
        ('Luvas de Procedimento P', 5, 'caixa'),
        ('Luvas de Procedimento M', 5, 'caixa'),
        ('Máscaras Descartáveis', 10, 'caixa'),
        ('Anestésico Lidocaína', 20, 'ampola'),
        ('Gaze Estéril', 50, 'pacote'),
        ('Kit Resina Composta (A1, A2, A3)', 1, 'kit'),
        ('Sugadores Descartáveis', 2, 'pacote');
        `);
            console.log('✅ Template inventory populated');
        }

        console.log('✅ Templates setup complete');
    } catch (error) {
        console.error('❌ Error setting up templates:', error);
    }
};

setupTemplates();

import 'dotenv/config';
import { webcrypto } from 'node:crypto';
if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: false, configurable: true });
}

import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Script para limpar o banco de dados antes da migração
 * ATENÇÃO: Este script apaga TODOS os dados!
 */

async function resetDatabase() {
    console.log('⚠️  ATENÇÃO: Este script vai APAGAR TODOS OS DADOS do banco!');
    console.log('');

    try {
        console.log('🗑️  Removendo todas as tabelas...');

        // Drop all tables in correct order (respecting foreign keys)
        await db.execute(sql`DROP TABLE IF EXISTS financial CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS appointments CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS orders CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS products CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS catalog_items CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS procedures CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS patients CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS clinic_members CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS professional_profiles CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS courier_profiles CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS patient_profiles CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS clinics CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS inventory CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS couriers CASCADE`);

        console.log('✅ Todas as tabelas foram removidas!');
        console.log('');
        console.log('📝 Próximos passos:');
        console.log('1. Execute: npm run db:push');
        console.log('2. Execute: npm run db:seed');

    } catch (error) {
        console.error('❌ Erro ao limpar banco:', error);
        throw error;
    }
}

resetDatabase()
    .then(() => {
        console.log('\n✅ Reset concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Erro fatal:', error);
        process.exit(1);
    });

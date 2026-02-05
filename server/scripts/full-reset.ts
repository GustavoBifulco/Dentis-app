
import 'dotenv/config';
import { webcrypto } from 'node:crypto';
if (typeof globalThis.crypto === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: false, configurable: true });
}

import { db } from '../db';
import { sql } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function fullReset() {
    console.log('⚠️  INICIANDO O FULL RESET (DB + CLERK) ⚠️');
    console.log('ISSO VAI APAGAR TUDO. TEM CERTEZA? (Esperando 5s...)');
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
        // 1. Limpar usuários do Clerk
        console.log('\n🗑️  Limpando usuários do Clerk...');
        try {
            const users = await clerkClient.users.getUserList({ limit: 100 });
            if (users.data.length > 0) {
                console.log(`Encontrados ${users.data.length} usuários no Clerk. Deletando...`);
                for (const user of users.data) {
                    await clerkClient.users.deleteUser(user.id);
                    console.log(`User ${user.id} deletado.`);
                }
            } else {
                console.log('Nenhum usuário encontrado no Clerk.');
            }
        } catch (clerkError: any) {
            console.error('Erro ao limpar Clerk (pode ser permissão ou chave inválida):', clerkError.message);
            console.log('Continuando com reset do banco...');
        }

        // 2. Limpar Banco de Dados
        console.log('\n🗑️  Limpando banco de dados...');

        // Drop extended list of tables
        const tables = [
            'notification_logs',
            'appointment_requests',
            'appointment_settings',
            'patient_invitations',
            'appointments',
            'financials',
            'orders',
            'products',
            'catalog_items',
            'procedures',
            'patients',
            'clinic_members',
            'organization_members', // New name
            'professional_profiles',
            'courier_profiles',
            'patient_profiles',
            'clinics',
            'organizations', // New name
            'users',
            'inventory',
            'template_inventory',
            'template_procedures',
            'couriers'
        ];

        for (const table of tables) {
            await db.execute(sql.raw(`DROP TABLE IF EXISTS ${table} CASCADE`));
            console.log(`Dropped ${table}`);
        }

        console.log('\n✅ Full Reset concluído com sucesso!');
        console.log('Execute agora: npm run db:push && npm run db:seed');

    } catch (error) {
        console.error('❌ Erro fatal no reset:', error);
        process.exit(1);
    }
}

fullReset()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

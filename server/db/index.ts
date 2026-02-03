import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Desabilita prefetch em produção e limita conexões para escalabilidade (Docker/Serverless)
const client = postgres(connectionString, {
    prepare: false,
    max: process.env.DB_MAX_CONNECTIONS ? Number(process.env.DB_MAX_CONNECTIONS) : 10
});

export const db = drizzle(client, { schema });

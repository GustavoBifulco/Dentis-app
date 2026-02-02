import type { Config } from "drizzle-kit";

export default {
  schema: "server/db/schema.ts",
  out: "./drizzle",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "postgres://dentis:dentis_secure_pass@db:5432/dentis_prod",
  },
} satisfies Config;

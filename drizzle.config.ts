import type { Config } from "drizzle-kit";

export default {
  schema: "server/db/schema.ts",
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://dentis:dentis_secure_pass@localhost:5432/dentis_prod",
  },
} satisfies Config;

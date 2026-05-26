import type { Config } from "drizzle-kit";
export default {
  schema: "./lib/schema/index.ts",
  out: "./lib/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_PATH || "./opslocker.db",
  },
  verbose: true,
  strict: true,
} satisfies Config;
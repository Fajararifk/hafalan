import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // CLI operations (migrate/generate/studio) need Neon's direct (non-pooled) connection —
  // pgbouncer transaction-mode pooling isn't safe for migration advisory locks.
  // The running app uses DATABASE_URL (pooled) instead, set explicitly in lib/prisma.ts.
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});

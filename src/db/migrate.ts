import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { logger } from "@/lib/logger";

/**
 * Applies pending SQL migrations before the server starts (Docker CMD).
 * Bundled to a single file at image build time, so the runtime image needs
 * neither drizzle-kit nor the TypeScript sources.
 */
const MIGRATION_LOCK_ID = 7_302_025;
const DEFAULT_MIGRATIONS_DIR = "./src/db/migrations";

async function runMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }
  const migrationsFolder = process.env.MIGRATIONS_DIR ?? DEFAULT_MIGRATIONS_DIR;

  // One connection so the advisory lock and the migration share a session:
  // two containers starting together can't apply the same migration twice.
  const client = postgres(databaseUrl, { max: 1, onnotice: () => {} });
  try {
    await client`select pg_advisory_lock(${MIGRATION_LOCK_ID})`;
    const startedAt = Date.now();
    await migrate(drizzle(client), { migrationsFolder });
    logger.info("migrations-applied", { durationMs: Date.now() - startedAt });
  } finally {
    await client`select pg_advisory_unlock(${MIGRATION_LOCK_ID})`.catch(() => undefined);
    await client.end();
  }
}

/** Connection failures surface as an AggregateError with an empty message; fall back to its code. */
function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const code = "code" in error ? String(error.code) : "";
  return error.message || code || error.name;
}

runMigrations().catch((error: unknown) => {
  logger.error("migrations-failed", { error: describeError(error) });
  process.exit(1);
});

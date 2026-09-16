import { sql } from "drizzle-orm";
import { db } from "@/db";

/** Runs a trivial query to confirm the database is reachable. Throws if it isn't. */
export async function pingDatabase(): Promise<void> {
  await db.execute(sql`select 1`);
}

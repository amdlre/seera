import { desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { type NewUser, type User, users } from "@/db/schema";

/**
 * Finds a non-deleted user by email. Returns null if none exists.
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user && !user.deletedAt ? user : null;
}

/**
 * Finds a user by email regardless of suspension, so the auth flow can tell a
 * suspended account apart from one that never existed.
 */
export async function findUserByEmailIncludingSuspended(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

/**
 * Finds a non-deleted user by id. Returns null if none exists.
 */
export async function findUserById(id: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user && !user.deletedAt ? user : null;
}

/**
 * Inserts a new user row and returns the created record.
 */
export async function insertUser(values: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(values).returning();
  return user;
}

/**
 * Lists every non-deleted user, most recently created first.
 */
export async function listActiveUsers(): Promise<User[]> {
  return db.select().from(users).where(isNull(users.deletedAt)).orderBy(desc(users.createdAt));
}

/**
 * Stamps `lastLoginAt` with the current time for the given user.
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
}

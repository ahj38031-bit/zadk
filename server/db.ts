import { and, desc, eq, gte, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, Meal, Profile, meals, profiles, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function requireDb(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("Database is not configured");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: user.lastSignedIn ?? new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getOrCreateProfile(userId: number): Promise<Profile> {
  const db = requireDb(await getDb());
  await db.insert(profiles).values({ userId }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!result[0]) throw new Error("Profile could not be created");
  return result[0];
}

export async function updateProfile(userId: number, data: Partial<Omit<Profile, "id" | "userId" | "updatedAt">>) {
  const db = requireDb(await getDb());
  await getOrCreateProfile(userId);
  await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.userId, userId));
  return getOrCreateProfile(userId);
}

export async function getMeals(userId: number, limit = 100) {
  const db = requireDb(await getDb());
  return db.select().from(meals).where(eq(meals.userId, userId)).orderBy(desc(meals.createdAt)).limit(limit);
}

export async function createMeal(data: typeof meals.$inferInsert) {
  const db = requireDb(await getDb());
  const result = await db.insert(meals).values(data);
  const created = await db.select().from(meals).where(eq(meals.id, result[0].insertId)).limit(1);
  if (!created[0]) throw new Error("Meal could not be created");
  return created[0];
}

export async function deleteMeal(userId: number, mealId: number) {
  const db = requireDb(await getDb());
  await db.delete(meals).where(and(eq(meals.id, mealId), eq(meals.userId, userId)));
  return { success: true } as const;
}

export async function clearTodayMeals(userId: number) {
  const db = requireDb(await getDb());
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 86_400_000);
  await db.delete(meals).where(and(eq(meals.userId, userId), gte(meals.createdAt, start), lt(meals.createdAt, end)));
  return { success: true } as const;
}

export type DashboardData = { profile: Profile; meals: Meal[] };

export async function getDashboard(userId: number): Promise<DashboardData> {
  return { profile: await getOrCreateProfile(userId), meals: await getMeals(userId) };
}

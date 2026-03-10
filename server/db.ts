import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// ============================================================
// 入札案件クエリ
// ============================================================
import { and, count, desc, like, or } from "drizzle-orm";
import { fetchLogs, personnelChanges, tenders } from "../drizzle/schema";

export interface TenderSearchParams {
  keyword?: string;
  prefecture?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function searchTenders(params: TenderSearchParams = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const { keyword, prefecture, category, status, limit = 100, offset = 0 } = params;

  try {
    const conditions = [];

    if (keyword) {
      conditions.push(
        or(
          like(tenders.title, `%${keyword}%`),
          like(tenders.municipality, `%${keyword}%`),
          like(tenders.description, `%${keyword}%`)
        )
      );
    }
    if (prefecture) conditions.push(eq(tenders.prefecture, prefecture));
    if (category) conditions.push(eq(tenders.category, category));
    if (status) conditions.push(eq(tenders.status, status as "公告中" | "受付終了" | "落札済み"));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // 全件数をCOUNTで取得
    const countResult = whereClause
      ? await db.select({ total: count() }).from(tenders).where(whereClause)
      : await db.select({ total: count() }).from(tenders);
    const total = countResult[0]?.total ?? 0;

    // ページ分のデータを取得
    const baseQuery = db
      .select()
      .from(tenders)
      .orderBy(desc(tenders.publishedAt))
      .limit(limit)
      .offset(offset);

    const items = whereClause
      ? await baseQuery.where(whereClause)
      : await baseQuery;

    return { items, total };
  } catch (err) {
    console.error("[DB] searchTenders error:", err);
    return { items: [], total: 0 };
  }
}

export async function getTenderStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, closed: 0, thisMonth: 0, categories: {} as Record<string, number> };

  try {
    const all = await db.select().from(tenders).limit(2000);
    const active = all.filter(t => t.status === "公告中").length;
    const closed = all.filter(t => t.status === "受付終了").length;
    const now = new Date();
    const thisMonth = all.filter(t => {
      if (!t.createdAt) return false;
      const d = new Date(t.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const categories: Record<string, number> = {};
    for (const t of all) {
      categories[t.category] = (categories[t.category] || 0) + 1;
    }
    return { total: all.length, active, closed, thisMonth, categories };
  } catch {
    return { total: 0, active: 0, closed: 0, thisMonth: 0, categories: {} as Record<string, number> };
  }
}

// ============================================================
// 人事異動クエリ
// ============================================================
export async function getRecentPersonnelChanges(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(personnelChanges)
      .orderBy(desc(personnelChanges.effectiveDate))
      .limit(limit);
  } catch {
    return [];
  }
}

// ============================================================
// フェッチログクエリ
// ============================================================
export async function getRecentFetchLogs(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(fetchLogs)
      .orderBy(desc(fetchLogs.fetchedAt))
      .limit(limit);
  } catch {
    return [];
  }
}

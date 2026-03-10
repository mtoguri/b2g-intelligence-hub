import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// 入札案件テーブル
// ============================================================
export const tenders = mysqlTable("tenders", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 128 }).unique(),
  title: text("title").notNull(),
  municipality: varchar("municipality", { length: 128 }).notNull(),
  prefecture: varchar("prefecture", { length: 64 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["公告中", "受付終了", "落札済み"]).default("公告中").notNull(),
  budget: decimal("budget", { precision: 15, scale: 0 }),
  publishedAt: timestamp("publishedAt"),
  deadline: timestamp("deadline"),
  demandScore: int("demandScore").default(0),
  matchScore: int("matchScore").default(0),
  description: text("description"),
  tags: json("tags").$type<string[]>(),
  sourceUrl: text("sourceUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastFetchedAt: timestamp("lastFetchedAt"),
});

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = typeof tenders.$inferInsert;

// ============================================================
// 予算データテーブル（分野別・年度別）
// ============================================================
export const budgetData = mysqlTable("budget_data", {
  id: int("id").autoincrement().primaryKey(),
  fiscalYear: int("fiscalYear").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  prefecture: varchar("prefecture", { length: 64 }),
  municipality: varchar("municipality", { length: 128 }),
  amount: decimal("amount", { precision: 15, scale: 0 }).notNull(),
  unit: varchar("unit", { length: 16 }).default("万円"),
  sourceType: varchar("sourceType", { length: 32 }).default("manual"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BudgetData = typeof budgetData.$inferSelect;
export type InsertBudgetData = typeof budgetData.$inferInsert;

// ============================================================
// 人事異動テーブル
// ============================================================
export const personnelChanges = mysqlTable("personnel_changes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  municipality: varchar("municipality", { length: 128 }).notNull(),
  prefecture: varchar("prefecture", { length: 64 }),
  oldPosition: text("oldPosition"),
  newPosition: text("newPosition").notNull(),
  effectiveDate: timestamp("effectiveDate"),
  importance: mysqlEnum("importance", ["高", "中", "低"]).default("中"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PersonnelChange = typeof personnelChanges.$inferSelect;
export type InsertPersonnelChange = typeof personnelChanges.$inferInsert;

// ============================================================
// データ取得ログテーブル（API同期履歴）
// ============================================================
export const fetchLogs = mysqlTable("fetch_logs", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["success", "error", "partial"]).notNull(),
  recordsFetched: int("recordsFetched").default(0),
  recordsInserted: int("recordsInserted").default(0),
  recordsUpdated: int("recordsUpdated").default(0),
  errorMessage: text("errorMessage"),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
});

export type FetchLog = typeof fetchLogs.$inferSelect;
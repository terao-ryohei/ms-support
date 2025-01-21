import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Sales テーブル
export const sales = sqliteTable("sales", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").notNull(),
  isDisable: integer("is_disable", { mode: "boolean" }).notNull(),
});

// Company テーブル
export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").notNull(),
  isDisable: integer("is_disable", { mode: "boolean" }).notNull(),
});

// Worker テーブル
export const workers = sqliteTable("workers", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").notNull(),
  isDisable: integer("is_disable", { mode: "boolean" }).notNull(),
});

// Contract テーブル
export const contract = sqliteTable("contract", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  from: integer("from", { mode: "timestamp" }).notNull(),
  to: integer("to", { mode: "timestamp" }).notNull(),
  contractType: text("contract_type").notNull(),
  subject: text("subject").notNull(),
  document: text("document").notNull(),
  isDisable: integer("is_disable", { mode: "boolean" }).notNull(),
  update: integer("update", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Payment テーブル
export const payment = sqliteTable("payment", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  isHour: integer("is_hour", { mode: "boolean" }).notNull(),
  isFixed: integer("is_fixed", { mode: "boolean" }).notNull(),
  paidFrom: integer("paid_from").notNull(),
  paidTo: integer("paid_to").notNull(),
  periodDate: text("period_date").notNull(),
  workPrice: integer("work_price").notNull(),
  roundType: text("round_type").notNull(),
  roundDigit: integer("round_digit").notNull(),
  calcType: text("calc_type").notNull(),
  overPrice: integer("over_price").notNull(),
  underPrice: integer("under_price").notNull(),
  isDisable: integer("is_disable", { mode: "boolean" }).notNull(),
  update: integer("update", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// workersRelation 中間テーブル
export const workersRelation = sqliteTable("workers_relation", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  companyId: integer("companies_id").references(() => companies.id), // Company の参照
  workerId: integer("worker_id").references(() => workers.id), // Worker の参照
  salesId: integer("sales_id").references(() => sales.id), // Sales との 1対多
  contractId: integer("contract_id")
    .references(() => contract.id)
    .notNull(), // Contract との 1対多
  paymentId: integer("payment_id")
    .references(() => payment.id)
    .notNull(), // Payment との 1対多
  type: text("type").notNull(),
});

// Userテーブル
export const user = sqliteTable("user", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  salt: text("salt").notNull(),
});

// Passテーブル
export const pass = sqliteTable("pass", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .references(() => user.id)
    .notNull(),
  pass: text("pass").notNull(),
  pepper: text("pepper").notNull(),
});

import {
  integer,
  pgTable,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const endpoints = pgTable("endpoints", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
  method: varchar({ length: 100 }).notNull(),
  expected_status: integer(),
  interval_seconds: integer().notNull(),
  is_active: boolean().notNull().default(true),
  created_at: timestamp().defaultNow(),
});

export const checks = pgTable("checks", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  endpoint_id: integer()
    .notNull()
    .references(() => endpoints.id),
  timestamp: timestamp().defaultNow(),
  status_code: integer(),
  response_time: integer(),
  is_up: boolean().notNull(),
  error_message: varchar({ length: 255 }),
});

export const incidents = pgTable("incidents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  endpoint_id: integer()
    .notNull()
    .references(() => endpoints.id),
  started_at: timestamp().defaultNow(),
  resolved_at: timestamp(),
  duration: integer(),
});

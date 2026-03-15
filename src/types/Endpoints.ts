export type Endpoints = {
  id: number;
  name: string;
  url: string;
  method: string;
  expected_status: number | undefined;
  interval_seconds: number;
  is_active: boolean;
  created_at: Date | undefined;
};

// export const endpoints = pgTable("endpoints", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   name: varchar({ length: 255 }).notNull(),
//   url: varchar({ length: 255 }).notNull(),
//   method: varchar({ length: 100 }).notNull(),
//   expected_status: integer(),
//   interval_seconds: integer().notNull(),
//   is_active: boolean().notNull().default(true),
//   created_at: timestamp().defaultNow(),
// });

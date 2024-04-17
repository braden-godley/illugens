import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `app_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  tokens: integer("tokens").notNull().default(0),
});

export const generationStatus = pgEnum("status", [
  "pending",
  "in_progress",
  "completed",
]);

export const generation = createTable("generation", {
  id: serial("id").primaryKey(),
  requestId: uuid("requestId").notNull().unique(),
  prompt: varchar("prompt", { length: 1024 }).notNull().default(""),
  status: generationStatus("status").notNull(),
  createdBy: varchar("createdBy", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdOn: timestamp("createdOn").default(sql`CURRENT_TIMESTAMP`),
});

export const generationRelations = relations(generation, ({ one }) => ({
  user: one(users, { fields: [generation.createdBy], references: [users.id] }),
}));

export const orders = createTable("order", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  tokens: integer("tokens").notNull(),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

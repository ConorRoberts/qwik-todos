import type { InferModel } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email"),
});

export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos),
}));

export type User = InferModel<typeof users, "select">;
export type NewUser = InferModel<typeof users, "insert">;

export const todos = sqliteTable("events", {
  id: integer("id").primaryKey(),
  title: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  userId: text("user_id").notNull(),
});

export const postsRelations = relations(todos, ({ one }) => ({
  user: one(users, { fields: [todos.userId], references: [users.id] }),
}));

export type Todo = InferModel<typeof todos, "select">;
export type NewTodo = InferModel<typeof todos, "insert">;

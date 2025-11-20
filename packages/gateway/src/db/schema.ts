import type { InferInsertModel } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { PlaybookTarget } from "../playbooks/playbook-schema";

export const playbooksTable = pgTable("playbooks", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: varchar("user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playbookServersTable = pgTable("playbook_servers", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  playbookId: varchar("playbook_id", { length: 255 })
    .notNull()
    .references(() => playbooksTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 10 }).notNull().$type<"http" | "stdio">(),

  // HTTP-specific fields
  url: text("url"),
  headers: jsonb("headers").$type<Record<string, string>>(),

  // STDIO-specific fields
  command: text("command"),
  args: jsonb("args").$type<string[]>(),
  env: jsonb("env").$type<Record<string, string>>(),

  // Common fields
  tools: jsonb("tools").$type<PlaybookTarget["tools"]>(),
  prompts: jsonb("prompts").$type<PlaybookTarget["prompts"]>(),
  disabled: boolean("disabled").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playbookPromptsTable = pgTable("playbook_prompts", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  playbookId: varchar("playbook_id", { length: 255 })
    .notNull()
    .references(() => playbooksTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PlaybookInsertParams = InferInsertModel<typeof playbooksTable>;
export type PlaybookServerInsertParams = InferInsertModel<
  typeof playbookServersTable
>;
export type PlaybookPromptInsertParams = InferInsertModel<
  typeof playbookPromptsTable
>;

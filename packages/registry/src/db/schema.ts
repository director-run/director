import { jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const entriesTable = pgTable("entries", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  transport: jsonb("transport").notNull().$type<{
    type: "stdio";
    command: string;
    args: string[];
  }>(),
  source: jsonb("source").notNull().$type<{
    type: "github";
    url: string;
  }>(),
  sourceRegistry: jsonb("source_registry").notNull().$type<{
    name: string;
  }>(),
  categories: jsonb("categories").notNull().$type<string[]>(),
});

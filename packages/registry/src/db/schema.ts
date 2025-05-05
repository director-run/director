import { jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const entriesTable = pgTable("entries", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
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
});

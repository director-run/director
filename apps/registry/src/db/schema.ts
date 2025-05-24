import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const entriesTable = pgTable("entries", {
  // **
  // ** Primary Attributes
  // **
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isOfficial: boolean("is_official").default(false), // Is it a servers that is officially supported by the companies or makers of the service
  isEnriched: boolean("is_enriched").default(false), // Has the entry been enriched?
  isConnectable: boolean("is_connectable").default(false), // Has the entry been enriched?
  lastConnectionAt: timestamp("last_connection_at"),
  lastConnectionError: text("last_connection_error"),

  // **
  // ** Transport
  // **
  transport: jsonb("transport").notNull().$type<
    | {
        type: "stdio";
        command: string;
        args: string[];
        env?: Record<string, string>;
      }
    | {
        type: "http";
        url: string;
      }
  >(),

  // **
  // ** Metadata
  // **
  homepage: varchar("homepage", { length: 255 }).notNull(),
  source_registry: jsonb("source_registry").$type<{
    name: string;
    entryId: string;
  }>(),

  // **
  // ** Documentation
  // **
  categories: jsonb("categories").default([]).$type<string[]>(),
  tools: jsonb("tools").default([]).$type<
    Array<{
      name: string;
      description: string;
      inputSchema: unknown;
    }>
  >(),
  parameters: jsonb("parameters").default([]).$type<Array<EntryParameter>>(),
  readme: text("readme"),
});

export type EntryCreateParams = InferInsertModel<typeof entriesTable>;
export type EntryGetParams = InferSelectModel<typeof entriesTable>;

// Only a very specific type of parameter is supported for now
export type EntryParameter = {
  name: string;
  description: string;
  scope: "env" | "args";
  required: true;
  type: "string";
};

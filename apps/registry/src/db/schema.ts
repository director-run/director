import type {
  EntryParameter,
  ProxyTransport,
  Tool,
} from "@director.run/utilities/schema";
import type { InferInsertModel } from "drizzle-orm";
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
  icon: varchar("icon", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  isOfficial: boolean("is_official").default(false), // Is it a servers that is officially supported by the companies or makers of the service
  isEnriched: boolean("is_enriched").default(false), // Has the entry been enriched?
  isConnectable: boolean("is_connectable").default(false), // Has the entry been enriched?
  lastConnectionAttemptedAt: timestamp("last_connection_attempted_at"),
  lastConnectionError: text("last_connection_error"),

  // **
  // ** Transport
  // **
  transport: jsonb("transport").notNull().$type<ProxyTransport>(),

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
  tools: jsonb("tools").default([]).$type<Array<Tool>>(),
  parameters: jsonb("parameters").notNull().$type<Array<EntryParameter>>(),
  readme: text("readme"),
});

export type EntryCreateParams = InferInsertModel<typeof entriesTable>;

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
        type: "sse";
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
      arguments?: string[];
      inputs?: Array<{
        name: string;
        type: string;
        required?: boolean;
        description?: string;
      }>;
    }>
  >(),
  parameters: jsonb("parameters").default([]).$type<
    Array<{
      name: string;
      description: string;
      scope: "env" | "args";
      schema: object; // serialized zod schema
    }>
  >(),
  readme: text("readme"),
});

export type EntryCreateParams = InferInsertModel<typeof entriesTable>;
export type EntryGetParams = InferSelectModel<typeof entriesTable>;
export type EntryParameters = InferSelectModel<
  typeof entriesTable
>["parameters"];

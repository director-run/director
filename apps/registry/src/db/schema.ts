import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const entriesTable = pgTable("entries", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  verified: boolean("verified").default(false),
  provider: varchar("provider", { length: 255 }),
  providerVerified: boolean("provider_verified").default(false),
  createdDate: timestamp("created_date"),
  runtime: varchar("runtime", { length: 50 }),
  license: varchar("license", { length: 50 }),
  sourceUrl: varchar("source_url", { length: 255 }),
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
  tools:
    jsonb("tools").$type<
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
  parameters:
    jsonb("parameters").$type<
      Array<{
        name: string;
        description: string;
        required?: boolean;
      }>
    >(),
  readme: text("readme"),
});

import type { InferInsertModel } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import type { PlaybookTarget } from "../playbooks/playbook-schema";

// User status type
export type UserStatus = "ACTIVE" | "PENDING";

// Better Auth tables
export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  status: text("status").$type<UserStatus>().default("PENDING").notNull(),
  // Encrypted API key (AES-256-GCM) - stores the user's default API key
  // Format: base64(iv):base64(authTag):base64(ciphertext)
  encryptedApiKey: text("encrypted_api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessionTable = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const accountTable = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const playbooksTable = pgTable(
  "playbooks",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique("playbooks_userId_id_unique").on(table.userId, table.id)],
);

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

// OAuth credentials for MCP servers (stored per-user, per-server)
export const oauthCredentialsTable = pgTable(
  "oauth_credentials",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // The user who owns these credentials
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    // The provider ID (typically serverId within a playbook)
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    // OAuth client information (client_id, client_secret, etc.)
    clientInformation: jsonb("client_information"),
    // OAuth tokens (access_token, refresh_token, etc.)
    tokens: jsonb("tokens"),
    // PKCE code verifier for in-progress auth flows
    codeVerifier: text("code_verifier"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("oauth_credentials_userId_idx").on(table.userId),
    unique("oauth_credentials_userId_providerId_unique").on(
      table.userId,
      table.providerId,
    ),
  ],
);

// API key table for better-auth's apiKey plugin
export const apikeyTable = pgTable(
  "apikey",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    start: text("start"),
    prefix: text("prefix"),
    key: text("key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    refillInterval: integer("refill_interval"),
    refillAmount: integer("refill_amount"),
    lastRefillAt: timestamp("last_refill_at"),
    enabled: boolean("enabled").default(true).notNull(),
    rateLimitEnabled: boolean("rate_limit_enabled").default(true).notNull(),
    rateLimitTimeWindow: integer("rate_limit_time_window"),
    rateLimitMax: integer("rate_limit_max"),
    requestCount: integer("request_count").default(0),
    remaining: integer("remaining"),
    lastRequest: timestamp("last_request"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    permissions: text("permissions"),
    metadata: text("metadata"),
  },
  (table) => [index("apikey_userId_idx").on(table.userId)],
);

export type PlaybookInsertParams = InferInsertModel<typeof playbooksTable>;
export type PlaybookServerInsertParams = InferInsertModel<
  typeof playbookServersTable
>;
export type PlaybookPromptInsertParams = InferInsertModel<
  typeof playbookPromptsTable
>;

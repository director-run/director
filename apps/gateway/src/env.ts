import path from "path";
import { red } from "@director.run/utilities/cli/colors";
import { isDevelopment, isTest } from "@director.run/utilities/env";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

// Load environment-specific .env files before validation
// Override is needed because some shells may have empty strings for env vars
if (isTest()) {
  dotenv.config({
    path: path.join(__dirname, "../env/.env.test"),
    override: true,
  });
} else if (isDevelopment()) {
  dotenv.config({
    path: path.join(__dirname, "../env/.env.development"),
    override: true,
  });
}

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BASE_URL: z.string().url().default("http://localhost:3673"),
    PORT: z
      .string()
      .default("3673")
      .transform((s) => parseInt(s, 10))
      .pipe(z.number().positive()),
    DEBUG: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
    REGISTRY_URL: z.string().url().default("https://registry.director.run"),
    REGISTRY_API_KEY: z.string().optional(),
    TELEMETRY_ENABLED: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
    TELEMETRY_WRITE_KEY: z.string().default(""),
    WAITLIST_ENABLED: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
    BETTER_AUTH_SECRET: z.string(),
    ALLOWED_ORIGINS: z
      .string()
      .default("")
      .transform((s) => s.split(",").filter(Boolean)),
    MANAGEMENT_API_KEY: z.string().optional(),
    DANGEROUSLY_ENABLE_SEEDING: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
    SEED_USER_EMAIL: z.string().optional(),
    SEED_USER_PASSWORD: z.string().optional(),
    DANGEROUSLY_ALLOW_ARBITRARY_STDIO_SERVERS: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
    DANGEROUSLY_ALLOW_INSECURE_HTTP_SERVERS: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
    // API key rate limiting configuration
    API_KEY_RATE_LIMIT_WINDOW_SECONDS: z
      .string()
      .default("60")
      .transform((s) => parseInt(s, 10))
      .pipe(z.number().positive()),
    API_KEY_RATE_LIMIT_MAX_REQUESTS: z
      .string()
      .default("1000")
      .transform((s) => parseInt(s, 10))
      .pipe(z.number().positive()),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

// Print warning if dangerous stdio mode is enabled
if (env.DANGEROUSLY_ALLOW_ARBITRARY_STDIO_SERVERS) {
  const warningLines = [
    "╔════════════════════════════════════════════════════════╗",
    "║                      WARNING                           ║",
    "╠════════════════════════════════════════════════════════╣",
    "║  DANGEROUSLY_ALLOW_ARBITRARY_STDIO_SERVERS is enabled  ║",
    "║                                                        ║",
    "║  This allows users to execute arbitrary commands on    ║",
    "║  the host system via stdio MCP servers. This is a      ║",
    "║  significant security risk in multi-tenant or          ║",
    "║  production environments.                              ║",
    "║                                                        ║",
    "║  Only enable this for local development or trusted     ║",
    "║  single-user deployments.                              ║",
    "╚════════════════════════════════════════════════════════╝",
  ];
  for (const line of warningLines) {
    console.warn(red(line));
  }
}

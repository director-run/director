import path from "path";
import { fileURLToPath } from "url";
import { isDevelopment, isTest } from "@director.run/utilities/env";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

// Get the package root directory relative to this file's location
// This works correctly regardless of where the process is run from
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");

// Load environment-specific .env files before validation
// Override is needed because some shells may have empty strings for env vars
if (isTest()) {
  dotenv.config({
    path: path.join(packageRoot, "env/.env.test"),
    override: true,
  });
} else if (isDevelopment()) {
  dotenv.config({
    path: path.join(packageRoot, "env/.env.dev"),
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
    BETTER_AUTH_SECRET: z
      .string()
      .default("development-secret-change-in-production"),
    ALLOWED_ORIGINS: z
      .string()
      .default("")
      .transform((s) => s.split(",").filter(Boolean)),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

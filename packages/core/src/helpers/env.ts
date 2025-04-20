import os from "node:os";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import packageJson from "../../package.json";

// Load env variables from .env, .env.local, .env.development, .env.test,
// .env.production, etc. from the current working directory
loadEnvConfig(process.cwd());

const DEFAULT_DATA_DIR = path.join(os.homedir(), ".director");

export const env = createEnv({
  server: {
    DEBUG: z.boolean().optional().default(false),
    VERSION: z.string().optional().default(packageJson.version),
    DATA_DIR: z.string().optional().default(DEFAULT_DATA_DIR),
    DB_FILE_PATH: z
      .string()
      .optional()
      .default(path.join(DEFAULT_DATA_DIR, "db.json")),
    SERVER_PORT: z.number({ coerce: true }).optional().default(3000),
    // Logging
    LOG_PRETTY: z.boolean().optional().default(true),
    LOG_LEVEL: z.string().optional().default("trace"),
    LOG_ERROR_STACK: z.boolean().optional().default(true),
  },
  runtimeEnv: process.env,
});

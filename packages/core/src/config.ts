import os from "node:os";
import path from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";
import packageJson from "../package.json";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: path.join(__dirname, "../env/.env.test") });
} else if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: path.join(__dirname, "../env/.env.development") });
}

const DEFAULT_DATA_DIR = path.join(os.homedir(), ".director");

const env = createEnv({
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
    NODE_ENV: z.enum(["test", "development", "production"]).optional(),
  },
  runtimeEnv: process.env,
});

export { env };

import os from "node:os";
import path from "node:path";
import { createEnv } from "@t3-oss/env-core";
import { config as loadConfig } from "dotenv";
import { z } from "zod";
import packageJson from "../../package.json";

if (process.env.NODE_ENV === "test") {
  loadConfig({ path: "./env/test.env" });
}

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
    SERVER_PORT: z.number().optional().default(3000),
    // Logging
    LOG_PRETTY: z.boolean().optional().default(true),
    LOG_LEVEL: z.string().optional().default("trace"),
    LOG_ERROR_STACK: z.boolean().optional().default(true),
  },
  runtimeEnv: process.env,
});

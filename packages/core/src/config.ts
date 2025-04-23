import os from "node:os";
import path from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";
import packageJson from "../package.json";

let DATA_DIR;

if (process.env.NODE_ENV === "production") {
  DATA_DIR = path.join(os.homedir(), `.director`);
} else {
  DATA_DIR = path.join(
    __dirname,
    `../.director/${process.env.NODE_ENV || "development"}`,
  );
}

dotenv.config({ path: path.join(DATA_DIR, "./config.env") });

export const env = createEnv({
  server: {
    VERSION: z.string().optional().default(packageJson.version),
    DATA_DIR: z.string().optional().default(DATA_DIR),
    DB_FILE_PATH: z.string().optional().default(path.join(DATA_DIR, "db.json")),
    SERVER_PORT: z.number({ coerce: true }).optional().default(3000),
    LOG_PRETTY: z.boolean().optional().default(true),
    LOG_LEVEL: z.string().optional().default("trace"),
    LOG_ERROR_STACK: z.boolean().optional().default(true),
    NODE_ENV: z
      .enum(["test", "development", "production"])
      .optional()
      .default("development"),
  },
  runtimeEnv: process.env,
});

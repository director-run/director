import os from "node:os";
import path from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

const DATA_DIR = getDataDir();

dotenv.config({ path: path.join(DATA_DIR, "./config.env") });

export const env = createEnv({
  server: {
    DATA_DIR: z.string().optional().default(DATA_DIR),
    DB_FILE_PATH: z.string().optional().default(path.join(DATA_DIR, "db.json")),
    SERVER_PORT: z.number({ coerce: true }).optional().default(3000),
  },
  runtimeEnv: process.env,
});

export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

function getDataDir() {
  if (process.env.NODE_ENV === "production") {
    return path.join(os.homedir(), `.director`);
  } else {
    return path.join(
      __dirname,
      `../../../.director/${process.env.NODE_ENV || "development"}`,
    );
  }
}

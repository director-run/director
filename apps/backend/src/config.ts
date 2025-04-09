import os from "node:os";
import path from "node:path";
import env from "dotenv";

if (process.env.NODE_ENV === "test") {
  env.config({ path: "./env/test.env" });
}

export const DATA_DIR =
  process.env.DATA_DIR ?? path.join(os.homedir(), ".director");

export const PROXY_DB_FILE_PATH =
  process.env.PROXY_DB_FILE_PATH ?? path.join(DATA_DIR, "db.json");

export const PORT = Number(process.env.PORT ?? 3000);

export const LOG_PRETTY = process.env.LOG_PRETTY !== "false";
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "trace";

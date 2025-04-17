import os from "node:os";
import path from "node:path";
import env from "dotenv";
import packageJson from "../package.json";

if (process.env.NODE_ENV === "test") {
  env.config({ path: "./env/test.env" });
}
export const VERSION = packageJson.version;

export const DATA_DIR =
  process.env.DATA_DIR ?? path.join(os.homedir(), ".director");

export const DB_FILE_PATH =
  process.env.DB_FILE_PATH ?? path.join(DATA_DIR, "db.json");

export const PORT = Number(process.env.PORT ?? 3000);

export const LOG_PRETTY = process.env.LOG_PRETTY !== "false";
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "trace";
export const LOG_ERROR_STACK = process.env.LOG_ERROR_STACK === "true";

export const PROXY_TARGET_CONNECT_RETRY_INTERVAL = Number(
  process.env.PROXY_TARGET_CONNECT_RETRY_INTERVAL ?? 2500,
);
export const PROXY_TARGET_CONNECT_RETRY_COUNT = Number(
  process.env.PROXY_TARGET_CONNECT_RETRY_COUNT ?? 3,
);

export const REGISTRY_URL =
  "https://gist.githubusercontent.com/barnaby/f8a47505aa8931317cf3010d680506b4/raw/6b586eeaf5fae1be43ec006f24035c39e43196b9/registry.json";

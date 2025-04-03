import os from "node:os";
import path from "node:path";
import packageJson from "../package.json";

export const DATA_DIR =
  process.env.DATA_DIR ?? path.join(os.homedir(), ".director");
export const BACKEND_PORT = Number(process.env.BACKEND_PORT ?? 3000);
export const DB_FILE_PATH =
  process.env.DB_FILE_PATH ??
  (process.env.NODE_ENV === "test"
    ? path.join(__dirname, "db.test.json")
    : path.join(DATA_DIR, "db.json"));
export const PACKAGE_NAME = packageJson.name;
export const PACKAGE_VERSION = packageJson.version;
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "trace";
export const LOG_PRETTY = true;

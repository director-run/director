import os from "node:os";
import path from "node:path";
import packageJson from "../package.json";

export const DATA_DIR =
  process.env.DATA_DIR ?? path.join(os.homedir(), ".director");

export const SSE_PORT = Number(process.env.SSE_PORT ?? 3006);

// This is the path to the config file
export const PROXY_DB_FILE_PATH =
  process.env.PROXY_DB_FILE_PATH ??
  (process.env.NODE_ENV === "test"
    ? path.join(__dirname, "../../config/proxy.db.test.json")
    : path.join(DATA_DIR, "proxy.db.json"));

export const PACKAGE_NAME = packageJson.name;
export const PACKAGE_VERSION = packageJson.version;
export const LOG_LEVEL = "trace";
export const LOG_PRETTY = true;

import os from "node:os";
import path from "node:path";

export const DATA_DIR = path.join(os.homedir(), ".director");

export const PROXY_DB_FILE_PATH =
  process.env.PROXY_DB_FILE_PATH ??
  (process.env.NODE_ENV === "test"
    ? path.join(__dirname, "db.test.json")
    : path.join(DATA_DIR, "db.json"));

export const PORT = Number(process.env.PORT ?? 3000);

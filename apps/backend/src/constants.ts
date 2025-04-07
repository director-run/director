import os from "node:os";
import path from "node:path";
import type { Config } from "./config/schema";

export const HOME_DIR = os.homedir();

export const DIRECTOR_DIR = ".director";

export const DATA_DIR = path.join(HOME_DIR, DIRECTOR_DIR);

export const DEFAULT_CONFIG_PATH = path.join(DATA_DIR, "db.json");
export const TEST_CONFIG_PATH = path.join(__dirname, "db.test.json");

export const PROXY_DB_FILE_PATH =
  process.env.PROXY_DB_FILE_PATH ??
  (process.env.NODE_ENV === "test" ? TEST_CONFIG_PATH : DEFAULT_CONFIG_PATH);

export const DEFAULT_CONFIG: Config = {
  proxies: [],
};

export const DEFAULT_SERVICE_PORT = Number(process.env.PORT ?? 3000);

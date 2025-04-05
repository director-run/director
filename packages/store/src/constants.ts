import os from "node:os";
import path from "node:path";
import { Config } from "@/schema";
export const HOME_DIR = os.homedir();

export const DIRECTOR_DIR = ".director";

export const DATA_DIR = path.join(HOME_DIR, DIRECTOR_DIR);

export const DEFAULT_PORT = Number(process.env.PORT ?? 3000);

export const DEFAULT_CONFIG_PATH = path.join(DATA_DIR, "db.json");

export const DEFAULT_CONFIG: Config = {
  version: "beta",
  port: DEFAULT_PORT,
  proxies: [],
};

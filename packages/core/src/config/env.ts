import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Config } from "./types";

const packageJson = JSON.parse(readFileSync(path.join(__dirname, "../../package.json"), "utf-8"));

// This is the default config that is written to the config file if it doesn't exist
export const DEFAULT_CONFIG: Config = JSON.parse(await readFile(path.join(__dirname, "../../config/config.default.json"), "utf-8"));

const DATA_DIRECTORY = path.join(os.homedir(), ".mcp-cli");

// This is the path to the config file
export const CONFIG_FILE_PATH = process.env.NODE_ENV === "test" ? path.join(__dirname, "../../config/config.test.json") : path.join(DATA_DIRECTORY, "config.json");

export const PACKAGE_NAME = packageJson.name;
export const PACKAGE_VERSION = packageJson.version;
export const LOG_LEVEL = "trace";
export const LOG_PRETTY = true;

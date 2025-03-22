import os from "node:os";
import path from "node:path";
import type { Config } from "./types";
import defaultConfig from "../../config/config.default.json";
import packageJson from "../../package.json";

// This is the default config that is written to the config file if it doesn't exist
export const DEFAULT_CONFIG: Config = defaultConfig;

const DATA_DIRECTORY = path.join(os.homedir(), ".mcp-cli");

// This is the path to the config file
export const CONFIG_FILE_PATH = process.env.NODE_ENV === "test" ? path.join(__dirname, "../../config/config.test.json") : path.join(DATA_DIRECTORY, "config.json");

export const PACKAGE_NAME = packageJson.name;
export const PACKAGE_VERSION = packageJson.version;
export const LOG_LEVEL = "trace";
export const LOG_PRETTY = true;

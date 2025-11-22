import path from "path";
import { isTest } from "@director.run/utilities/env";
import dotenv from "dotenv";

if (isTest()) {
  console.log("Loading test environment");
  dotenv.config({ path: path.join(__dirname, "../env/.env.test") });
} else {
  console.log("Loading development environment");
  dotenv.config({ path: path.join(__dirname, "../env/.env.dev") });
}

export const DEBUG = false;
export const SERVER_PORT = isTest() ? 4673 : 3673;
export const REGISTRY_URL = "https://registry.director.run";
export const REGISTRY_API_KEY = "";
export const TELEMETRY_WRITE_KEY = "";
export const TELEMETRY_ENABLED = false;
export const OAUTH_STORAGE = "disk";
export const OAUTH_TOKEN_DIRECTORY = "./tokens";
export const ALLOWED_ORIGINS = ["http://localhost:3000"];

export const DATABASE_URL = process.env.DATABASE_URL || "";
export const WAITLIST_ENABLED = true; //process.env.WAITLIST_ENABLED === "true";

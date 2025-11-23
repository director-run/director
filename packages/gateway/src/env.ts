import path from "path";
import { isDevelopment, isTest } from "@director.run/utilities/env";
import dotenv from "dotenv";

if (isTest()) {
  console.log("Loading test environment");
  dotenv.config({ path: path.join(__dirname, "../env/.env.test") });
} else if (isDevelopment()) {
  console.log("Loading development environment");
  dotenv.config({ path: path.join(__dirname, "../env/.env.dev") });
} else {
  console.log("Loading production environment");
}

export const DEBUG = process.env.DEBUG === "true";
export const SERVER_PORT = parseInt(process.env.PORT || "3673");
export const REGISTRY_URL =
  process.env.REGISTRY_URL || "https://registry.director.run";
export const REGISTRY_API_KEY = process.env.REGISTRY_API_KEY;
export const TELEMETRY_WRITE_KEY = "";
export const TELEMETRY_ENABLED = process.env.TELEMETRY_ENABLED === "true";
export const OAUTH_STORAGE = "disk";
export const OAUTH_TOKEN_DIRECTORY = "./tokens";
export const ALLOWED_ORIGINS = ["http://localhost:3000"];

export const DATABASE_URL = process.env.DATABASE_URL || "";
export const WAITLIST_ENABLED = true; //process.env.WAITLIST_ENABLED === "true";
export const BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET || "development-secret-change-in-production";
export const BASE_URL = process.env.BASE_URL || "";

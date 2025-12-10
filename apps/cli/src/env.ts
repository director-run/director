import os from "node:os";
import path from "path";
import { isDevelopment, isStaging, isTest } from "@director.run/utilities/env";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

let envFilePath = "";

if (isTest()) {
  envFilePath = path.join(__dirname, "../env/.env.test");
} else if (isDevelopment()) {
  envFilePath = path.join(__dirname, "../env/.env.dev");
} else if (isStaging()) {
  envFilePath = path.join(__dirname, "../env/.env.staging");
}

if (envFilePath) {
  dotenv.config({
    path: envFilePath,
    override: true,
  });
}

export const ENV_FILE_PATH = envFilePath;

export const env = createEnv({
  server: {
    CLIENT_KEY_PREFIX: z.string().default("drctr__"),
    REGISTRY_URL: z.string().url().default("https://registry.director.run"),
    REGISTRY_API_KEY: z.string().optional(),
    AUTH_TOKEN_FILE: z
      .string()
      .default(path.join(os.homedir(), ".director", "auth")),
    DEBUG: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
    GATEWAY_URL: z.string().url().default("https://gateway.director.run"),
    STUDIO_URL: z.string().url().default("https://gateway.director.run/studio"),
    USER_EMAIL: z.string().email().optional(),
    USER_PASSWORD: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

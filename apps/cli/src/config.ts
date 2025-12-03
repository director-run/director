import path from "path";
import { isDevelopment, isTest } from "@director.run/utilities/env";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

if (isTest()) {
  dotenv.config({
    path: path.join(__dirname, "../env/.env.test"),
    override: true,
  });
} else if (isDevelopment()) {
  dotenv.config({
    path: path.join(__dirname, "../env/.env.dev"),
    override: true,
  });
}

export const env = createEnv({
  server: {
    REGISTRY_URL: z.string().url().default("https://registry.director.run"),
    REGISTRY_API_KEY: z.string().optional(),
    DEBUG: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
    GATEWAY_URL: z.string().url().default("https://app.staging.ex0.co"),
    STUDIO_URL: z.string().url().default("https://app.staging.ex0.co/studio"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

import { createEnv as t3createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

export function createEnv(params: {
  envFilePath?: string;
  envVars: Record<string, z.ZodType>;
}) {
  if (params.envFilePath) {
    dotenv.config({ path: params.envFilePath });
  }
  return t3createEnv({
    server: params.envVars,
    runtimeEnv: process.env,
  });
}

export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export function isTest() {
  return process.env.NODE_ENV === "test";
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

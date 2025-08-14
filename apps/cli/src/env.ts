import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createEnv, isProduction, isTest } from "@director.run/utilities/env";
import { z } from "zod";

export const LOCAL_ENV_FILE_PATH = path.join(process.cwd(), ".env.local");

const SEGMENT_PRODUCTION_WRITE_KEY = "Z8wjEfWMFnlltCpGPPWlvsEQH1aVEUH3";

export const env = createEnv({
  envFilePath: getEnvFilePath(),
  envVars: {
    GATEWAY_PORT: z.number({ coerce: true }).optional().default(3673),
    GATEWAY_URL: z.string().optional().default(`http://localhost:3673`),
    STUDIO_URL: z.string().optional().default(`https://studio.director.run`),
    SEGMENT_WRITE_KEY: z
      .string()
      .optional()
      .default(SEGMENT_PRODUCTION_WRITE_KEY),
    REGISTRY_API_URL: z
      .string()
      .optional()
      .default(`https://registry.director.run`),
    REGISTRY_API_KEY: z.string().optional().default(""),
    OAUTH_TOKEN_DIRECTORY: z
      .string()
      .optional()
      .default(path.join(getDataDir(), "tokens")),
    CONFIG_FILE_PATH: z
      .string()
      .optional()
      .default(path.join(getDataDir(), "config.yaml")),
    ENABLE_DEBUG_COMMANDS: z
      .string()
      .default("false")
      .transform((s) => s !== "false" && s !== "0"),
    SEND_TELEMETRY: z
      .string()
      .default("true")
      .transform((s) => s !== "false" && s !== "0"),
  },
});

export function getEnvFilePath(): string {
  if (fs.existsSync(LOCAL_ENV_FILE_PATH)) {
    return LOCAL_ENV_FILE_PATH;
  } else {
    return path.join(getDataDir(), "./config.env");
  }
}

export function isUsingEnvFile(): boolean {
  return fs.existsSync(getEnvFilePath());
}

function getDataDir(): string {
  if (isProduction()) {
    return path.join(os.homedir(), `.director`);
  } else if (isTest()) {
    return path.join(__dirname, `../.director/test`);
  } else {
    return path.join(__dirname, `../.director/development`);
  }
}

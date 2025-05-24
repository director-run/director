import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  createEnv,
  isDevelopment,
  isProduction,
  isTest,
} from "@director.run/utilities/env";
import { z } from "zod";

export const env = createEnv({
  envFilePath: getEnvFilePath(),
  envVars: {
    GATEWAY_PORT: z.number({ coerce: true }).optional().default(3673),
    GATEWAY_URL: z.string().optional().default(`http://localhost:3673`),
    STUDIO_URL: z.string().optional().default(`https://studio.director.run`),
    REGISTRY_API_URL: z
      .string()
      .optional()
      .default(`https://registry.director.run`),
    REGISTRY_API_KEY: z.string().optional().default(""),
    DB_FILE_PATH: z
      .string()
      .optional()
      .default(path.join(getDataDir(), "db.json")),
  },
});

function getEnvFilePath() {
  const localEnvPath = path.join(process.cwd(), "./.env.local");
  if (fs.existsSync(localEnvPath) && isDevelopment()) {
    // In development, we want to use the local env file if it exists in the current working directory
    return localEnvPath;
  } else {
    return path.join(getDataDir(), "./config.env");
  }
}

function getDataDir() {
  if (isProduction()) {
    return path.join(os.homedir(), `.director`);
  } else if (isTest()) {
    return path.join(__dirname, `../.director/test`);
  } else {
    return path.join(__dirname, `../.director/development`);
  }
}

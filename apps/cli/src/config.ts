import os from "node:os";
import path from "node:path";
import { createEnv, isProduction, isTest } from "@director.run/utilities/env";
import { z } from "zod";

export const env = createEnv({
  envFilePath: path.join(getDataDir(), "./config.env"),
  envVars: {
    GATEWAY_PORT: z.number({ coerce: true }).optional().default(3673),
    GATEWAY_URL: z.string().optional().default(`http://localhost:3673`),
    REGISTRY_API_URL: z
      .string()
      .optional()
      .default(`https://registry.director.run`),
    REGISTRY_API_WRITE_KEY: z.string().optional().default(""),
    DB_FILE_PATH: z
      .string()
      .optional()
      .default(path.join(getDataDir(), "db.json")),
    // LOG_PRETTY: z.boolean().optional().default(true),
    // LOG_LEVEL: z.string().optional().default("trace"),
    // LOG_ERROR_STACK: z.boolean().optional().default(true),
  },
});

function getDataDir() {
  if (isProduction()) {
    return path.join(os.homedir(), `.director`);
  } else if (isTest()) {
    return path.join(__dirname, `../.director/test`);
  } else {
    return path.join(__dirname, `../.director/development`);
  }
}

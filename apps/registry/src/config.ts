import path from "path";
import { createEnv, isTest } from "@director.run/utilities/env";
import { isFilePresent } from "@director.run/utilities/os";
import { z } from "zod";

export const env = createEnv({
  envFilePath: getEnvFilePath(),
  envVars: {
    PORT: z.number({ coerce: true }).default(3080),
    DATABASE_URL: z.string(),
    MANAGEMENT_API_KEY: z.string().optional(),
    BASE_URL: z.string().default("https://registry.director.run"),
    DANGEROUSLY_ENRICH_TOOLS_DURING_SEED: z
      .string()
      .default("false")
      .transform((s) => s === "true"),
  },
});

function getEnvFilePath() {
  if (isTest()) {
    return path.join(__dirname, "../env/.env.test");
  } else if (isFilePresent(path.join(__dirname, "../.env.local"))) {
    return path.join(__dirname, "../.env.local");
  } else {
    return path.join(__dirname, "../env/.env.dev");
  }
}

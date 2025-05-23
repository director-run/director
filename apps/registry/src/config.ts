import path from "path";
import { createEnv, isTest } from "@director.run/utilities/env";
import { isFilePresent } from "@director.run/utilities/os";
import { z } from "zod";

export const env = createEnv({
  envFilePath: getEnvFilePath(),
  envVars: {
    PORT: z.number({ coerce: true }),
    DATABASE_URL: z.string(),
    API_KEY: z.string(),
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

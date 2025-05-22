import path from "path";
import { createEnv, isProduction, isTest } from "@director.run/utilities/env";
import { isFilePresent } from "@director.run/utilities/os";
import { z } from "zod";

export const env = createEnv({
  envFilePath: getEnvFilePath(),
  envVars: {
    PORT: z.number({ coerce: true }),
    DATABASE_URL: z.string(),
  },
});

function getEnvFilePath() {
  if (isFilePresent(path.join(__dirname, "../.env.local"))) {
    return path.join(__dirname, "../.env.local");
  } else if (isTest()) {
    return path.join(__dirname, "../env/.env.test");
  } else if (isProduction()) {
    return path.join(__dirname, "../env/.env");
  } else {
    return path.join(__dirname, "../env/.env.dev");
  }
}

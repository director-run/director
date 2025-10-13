import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Config } from "@director.run/gateway/config/index";
import {
  createEnv,
  isDevelopment,
  isProduction,
  isTest,
} from "@director.run/utilities/env";
import { Telemetry } from "@director.run/utilities/telemetry";
import { z } from "zod";
import packageJson from "../package.json" assert { type: "json" };

export const LOCAL_ENV_FILE_PATH = path.join(process.cwd(), ".env.local");

const SEGMENT_PRODUCTION_WRITE_KEY = "Z8wjEfWMFnlltCpGPPWlvsEQH1aVEUH3";

export const env = createEnv({
  envFilePath: getEnvFilePath(),
  envVars: {
    OAUTH_TOKEN_DIRECTORY: z
      .string()
      .optional()
      .default(path.join(getDataDir(), "tokens")),
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

function getConfigFilePath(): string {
  return path.join(getDataDir(), "./config.yaml");
}

export const config = await Config.createFileBasedConfig({
  filePath: getConfigFilePath(),
  defaults: {
    debug: isDevelopment(),
    registry: {
      url: "https://registry.director.run",
    },
    server: {
      port: isTest() ? 3675 : parseInt(process.env.GATEWAY_PORT ?? "3673"),
    },
    telemetry: {
      writeKey: isProduction() ? SEGMENT_PRODUCTION_WRITE_KEY : "--",
      enabled: isProduction(),
    },
    oauth: {
      storage: "disk",
      tokenDirectory: `./oauth-tokens`,
    },
  },
});

function getDataDir(): string {
  if (isProduction()) {
    return path.join(os.homedir(), `.director`);
  } else if (isTest()) {
    return path.join(__dirname, `../.director/test`);
  } else {
    return path.join(__dirname, `../.director/development`);
  }
}

export function getGatewayBaseUrl(): string {
  return `http://localhost:${config.get("server.port")}`;
}

export function getStudioUrl(): string {
  return `${getGatewayBaseUrl()}/studio`;
}

export function getTelemetry(): Telemetry {
  return new Telemetry({
    writeKey: config.get("telemetry.writeKey") ?? "--",
    enabled: !!config.get("telemetry.enabled"),
    traits: {
      cliVersion: packageJson.version,
    },
  });
}

import os from "node:os";
import path from "node:path";
import { Config } from "@director.run/gateway/config/index";
import {
  isDevelopment,
  isProduction,
  isTest,
} from "@director.run/utilities/env";
import { Telemetry } from "@director.run/utilities/telemetry";
import packageJson from "../package.json" assert { type: "json" };

const SEGMENT_PRODUCTION_WRITE_KEY = "Z8wjEfWMFnlltCpGPPWlvsEQH1aVEUH3";

export function getConfigFilePath(): string {
  if (isTest()) {
    return path.join(__dirname, `../../../director.config.test.yaml`);
  } else if (isDevelopment()) {
    return path.join(__dirname, `../../../director.config.development.yaml`);
  } else {
    return path.join(os.homedir(), `.director/director.config.yaml`);
  }
}

function getOauthDefaults() {
  if (isTest()) {
    return {
      storage: "memory",
    };
  } else {
    return {
      storage: "disk",
      tokenDirectory: path.join(
        path.dirname(getConfigFilePath()),
        `.secrets/director-oauth-tokens`,
      ),
    };
  }
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
    oauth: getOauthDefaults(),
  },
});

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

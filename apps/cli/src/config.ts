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
  return path.join(getDataDir(), "./config.yaml");
}

// export function getConfigFilePath(): string {
//   if (isTest()) {
//     return path.join(__dirname, `../.director/test/config.yaml`);
//   } else if (isDevelopment()) {
//     return path.join(getDataDir(), "./config.yaml");
//   }
//   else {
//     return path.join(os.homedir(), `.director`);
//   }
// }

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
      tokenDirectory: `./director-oauth-tokens`,
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

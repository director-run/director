import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { isDevelopment, isTest } from "@director.run/utilities/env";
import { findFirstMatch } from "@director.run/utilities/fs";

// if (isTest()) {
//   dotenv.config({
//     path: path.join(__dirname, "../env/.env.test"),
//     override: true,
//   });
// } else if (isDevelopment()) {
//   dotenv.config({
//     path: path.join(__dirname, "../env/.env.dev"),
//     override: true,
//   });
// }

export const REGISTRY_URL =
  process.env.REGISTRY_URL || "https://registry.director.run";
export const REGISTRY_API_KEY = process.env.REGISTRY_API_KEY || "";
export const DEBUG = process.env.DEBUG === "true";

export function getConfigFilePath(): string {
  if (isTest()) {
    return path.join(__dirname, `../../../director.config.test.yaml`);
  } else if (isDevelopment()) {
    return path.join(__dirname, `../../../director.config.development.yaml`);
  } else {
    const defaultConfigPath = path.join(
      os.homedir(),
      `.director/director.config.yaml`,
    );
    const cwdConfigPath = path.join(process.cwd(), `director.config.yaml`);

    return (
      findFirstMatch([cwdConfigPath, defaultConfigPath]) ?? defaultConfigPath
    );
  }
}

// function getOauthDefaults() {
//   if (isTest()) {
//     return {
//       storage: "memory",
//     };
//   } else {
//     return {
//       storage: "disk",
//       tokenDirectory: path.join(
//         path.dirname(getConfigFilePath()),
//         `.secrets/director-oauth-tokens`,
//       ),
//     };
//   }
// }

const configDir = path.dirname(getConfigFilePath());

await fs.mkdir(configDir, { recursive: true });

// export const config = await Config.createFileBasedConfig({
//   filePath: getConfigFilePath(),
//   defaults: {
//     debug: isDevelopment(),
//     registry: {
//       url: "https://registry.director.run",
//     },
//     server: {
//       port: isTest() ? 3675 : parseInt(process.env.GATEWAY_PORT ?? "3673"),
//     },
//     telemetry: {
//       writeKey: isProduction() ? SEGMENT_PRODUCTION_WRITE_KEY : "--",
//       enabled: isProduction(),
//     },
//     oauth: getOauthDefaults(),
//   },
// });

export function getGatewayBaseUrl(): string {
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");

  // console.log("GATEWAY_URL", process.env.GATEWAY_URL);
  // console.log("process.env", process.env.LOG_LEVEL);
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");
  // console.log("--------------------------------");

  return process.env.GATEWAY_URL || `http://localhost:3600`;
}

export function getStudioUrl(): string {
  return `${getGatewayBaseUrl()}/studio`;
}

// export function getTelemetry(): Telemetry {
//   return new Telemetry({
//     writeKey: config.get("telemetry.writeKey") ?? "--",
//     enabled: !!config.get("telemetry.enabled"),
//     traits: {
//       cliVersion: packageJson.version,
//     },
//   });
// }

import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Gateway } from "@director.run/gateway/gateway";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  printDirectorAscii,
} from "@director.run/utilities/cli/index";
import { getLogger } from "@director.run/utilities/logger";
import packageJson from "../../../package.json";
import { env } from "../../env";

export function registerServeCommand(program: DirectorCommand) {
  program
    .command("serve")
    .description("Start the web service")
    .action(
      actionWithErrorHandler(async () => {
        try {
          await startGateway();
        } catch (error) {
          console.error("Fatal error starting gateway", error);
          process.exit(1);
        }
      }),
    );
}

export async function startGateway(successCallback?: () => void) {
  console.log(`v${packageJson.version}`);
  printDirectorAscii();

  await Gateway.start(
    {
      port: env.GATEWAY_PORT,
      configuration: {
        type: "yaml",
        filePath: env.CONFIG_FILE_PATH,
      },
      registryURL: env.REGISTRY_API_URL,
      studioDistPath: resolveStudioDistPath(),
      allowedOrigins: [env.STUDIO_URL, /^https?:\/\/localhost(:\d+)?$/],
      telemetry: {
        writeKey: env.SEGMENT_WRITE_KEY,
        enabled: env.SEND_TELEMETRY,
        traits: {
          cliVersion: packageJson.version,
        },
      },
      headers: {
        "X-Cli-Version": packageJson.version,
      },
      oauth: {
        enabled: true,
        storage: "disk",
        tokenDirectory: env.OAUTH_TOKEN_DIRECTORY,
      },
    },
    successCallback,
  );
}

const resolveStudioDistPath = (): string | undefined => {
  const logger = getLogger("resolveStudioDistPath");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const candidates = [
    // Running in development
    path.join(__dirname, "../../../dist/studio"),
    // Running from compiled JS
    path.join(__dirname, "./studio"),
  ];

  logger.trace({ __dirname });
  logger.trace({
    message: "attempting to resolve studio dist path",
    candidates,
  });

  for (const candidate of candidates) {
    const indexFile = path.join(candidate, "index.html");
    try {
      if (fs.existsSync(indexFile)) {
        logger.info({
          message: "found index.html in candidate path",
          candidate,
        });
        return candidate;
      }
    } catch {
      logger.error({
        message: "could not find index.html in any of the candidate paths",
      });
      return undefined;
    }
  }

  // Final fallback to a sensible default relative to __dirname
  return path.join(__dirname, "../../studio");
};

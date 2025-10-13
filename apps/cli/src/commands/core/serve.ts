import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Config } from "@director.run/gateway/config/index";
import { Gateway } from "@director.run/gateway/gateway";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  printDirectorAscii,
} from "@director.run/utilities/cli/index";
import { findFirstMatch } from "@director.run/utilities/fs";
import { getLogger } from "@director.run/utilities/logger";
import { Telemetry } from "@director.run/utilities/telemetry";
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
      config: await Config.createFileBasedConfig({
        filePath: env.CONFIG_FILE_PATH,
        defaults: {
          registry: {
            url: "https://registry.director.run",
          },
          server: {
            port: 3673,
          },
          telemetry: {
            writeKey: "test-write-key",
            enabled: true,
          },
          oauth: {
            storage: "disk",
            tokenDirectory: "./tokens",
          },
        },
      }),
      studioDistPath: resolveStudioDistPath(),
      telemetry: new Telemetry({
        writeKey: env.SEGMENT_WRITE_KEY,
        enabled: env.SEND_TELEMETRY,
        traits: {
          cliVersion: packageJson.version,
        },
      }),
      oauth: {
        storage: "disk",
        tokenDirectory: env.OAUTH_TOKEN_DIRECTORY,
      },
    },
    successCallback,
  );
}

const resolveStudioDistPath = (): string | undefined => {
  const logger = getLogger("resolveStudioDistPath");

  const __dirname = dirname(fileURLToPath(import.meta.url));

  const candidates = [
    path.join(__dirname, "../../../dist/studio/index.html"), // development
    path.join(__dirname, "./studio/index.html"), // compiled JS
  ];

  logger.debug({
    message: "attempting to resolve studio dist path",
    candidates,
  });

  return findFirstMatch(candidates);
};

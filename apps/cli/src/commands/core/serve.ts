// import path from "path";
// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { Gateway } from "@director.run/gateway/gateway";
// import { DirectorCommand } from "@director.run/utilities/cli/director-command";
// import {
//   actionWithErrorHandler,
//   printDirectorAscii,
// } from "@director.run/utilities/cli/index";
// import { findFirstMatch } from "@director.run/utilities/fs";
// import { getLogger } from "@director.run/utilities/logger";
// import packageJson from "../../../package.json";
// import {
//   getConfigFilePath,
//   getGatewayBaseUrl,
//   getTelemetry,
// } from "../../config";
// import { config } from "../../config";

// export function registerServeCommand(program: DirectorCommand) {
//   program
//     .command("serve")
//     .description("Start the web service")
//     .action(
//       actionWithErrorHandler(async () => {
//         try {
//           await startGateway();
//         } catch (error) {
//           console.error("Fatal error starting gateway", error);
//           process.exit(1);
//         }
//       }),
//     );
// }

// export async function startGateway(successCallback?: () => void) {
//   console.log(`version: v${packageJson.version}`);
//   console.log(`config:  ${getConfigFilePath()}`);
//   printDirectorAscii();

//   await Gateway.start(
//     {
//       config,
//       studioAssetsPath: getStudioAssetsPath(),
//       telemetry: getTelemetry(),
//       baseUrl: getGatewayBaseUrl(),
//     },
//     successCallback,
//   );
// }

// const getStudioAssetsPath = (): string | undefined => {
//   const logger = getLogger("resolveStudioDistPath");

//   const __dirname = dirname(fileURLToPath(import.meta.url));

//   const candidates = [
//     path.join(__dirname, "../../../dist/studio/index.html"), // development
//     path.join(__dirname, "./studio/index.html"), // compiled JS
//   ];

//   logger.debug({
//     message: "attempting to resolve studio dist path",
//     candidates,
//   });

//   const match = findFirstMatch(candidates);
//   return match ? path.dirname(match) : undefined;
// };

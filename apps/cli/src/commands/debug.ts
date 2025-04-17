import { Command } from "commander";
import { seed } from "../../../backend/src/services/db/seed";
import * as config from "../config";
import { withErrorHandler } from "../helpers";

export function registerDebugCommands(program: Command) {
  program.command("debug").action(
    withErrorHandler(async () => {
      console.log("----------------");
      console.log("__dirname: ", __dirname);
      console.log("__filename: ", __filename);
      console.log(`config:`, config);
      console.log("----------------");
    }),
  );
  program.command("seed").action(
    withErrorHandler(() => {
      seed();
    }),
  );
}

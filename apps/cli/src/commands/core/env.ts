import { yellow } from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { makeTable } from "@director.run/utilities/cli/index";
import { ENV_FILE_PATH, env } from "../../env";

export function registerConfigCommand(program: DirectorCommand): void {
  program
    .command("env")
    .description("Print environment variables")
    .action(
      actionWithErrorHandler(() => {
        const table = makeTable(["Key", "Value"]);

        table.push([yellow("ENV_FILE_PATH"), yellow(ENV_FILE_PATH ?? "--")]);
        for (const [key, value] of Object.entries(env)) {
          table.push([key, value ?? "--"]);
        }

        console.log(table.toString());
      }),
    );
}

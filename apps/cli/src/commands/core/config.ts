import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { config } from "../../env";

export function registerConfigCommand(program: DirectorCommand): void {
  program
    .command("config")
    .description("Print config")
    .action(
      actionWithErrorHandler(() => {
        config.prettyPrint();
      }),
    );
}

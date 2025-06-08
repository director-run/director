import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { env } from "../../env";

export function registerEnvCommand(program: DirectorCommand): void {
  program
    .command("env")
    .description("Print environment variables")
    .action(
      actionWithErrorHandler(() => {
        console.log(`env`, env);
      }),
    );
}

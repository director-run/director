import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { startGateway } from "./serve";
import { openStudio } from "./studio";

export function registerQuickstartCommand(program: DirectorCommand) {
  program
    .command("quickstart")
    .description("shortcut to start the gateway and open the studio")
    .action(
      actionWithErrorHandler(async () => {
        await startGateway(async () => {
          await openStudio();
        });
      }),
    );
}

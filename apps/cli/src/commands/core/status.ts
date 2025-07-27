import { getStatus } from "@director.run/gateway/status";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import cliPackage from "../../../package.json";

export function registerStatusCommand(program: DirectorCommand) {
  program
    .command("status")
    .description("Get the status of the director")
    .action(
      actionWithErrorHandler(async () => {
        const status = await getStatus(cliPackage.version);
        console.log(status);
      }),
    );
}

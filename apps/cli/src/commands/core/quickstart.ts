import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { getLogger } from "@director.run/utilities/logger";
import { env } from "../../env";
import { startGateway } from "./serve";
import { openStudio } from "./studio";

const logger = getLogger("quickstart");

export function registerQuickstartCommand(program: DirectorCommand) {
  program
    .command("quickstart")
    .description("shortcut to start the gateway and open the studio")
    .action(
      actionWithErrorHandler(async () => {
        await startGateway(async () => {
          logger.info(
            `gateway started, opening ${env.STUDIO_URL} in your browser...`,
          );
          await openStudio();
        });
      }),
    );
}

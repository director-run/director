import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { loader } from "@director.run/utilities/cli/loader";
import { openUrl } from "@director.run/utilities/os";
import { gatewayClient } from "../../client";
import { env } from "../../env";

export function registerStudioCommand(program: DirectorCommand) {
  program
    .command("studio")
    .description("Open the UI in your browser")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start("opening studio...");
        try {
          await gatewayClient.health.query();
        } catch (error) {
          spinner.fail(
            "Failed to connect to gateway. Have you ran `director serve`?",
          );
          process.exit(1);
        }
        try {
          openStudio();
        } catch (error) {
          spinner.fail(`failed to open ${env.STUDIO_URL}, try manually`);
        }
        spinner.stop();
      }),
    );
}

export async function openStudio() {
  await openUrl(env.STUDIO_URL);
}

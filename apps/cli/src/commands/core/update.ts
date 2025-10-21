import { parseKeyValueAttributes } from "@director.run/utilities/cli/attribute-parser";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../../client";
import { printPlaybookDetails, printTargetDetails } from "./get";

export function registerUpdateCommand(program: DirectorCommand) {
  return program
    .command("update <playbookId> [serverName]")
    .description("Update playbook attributes")
    .addOption(
      makeOption({
        flags: "-a,--attribute <key=value>",
        description:
          "set attribute in key=value format (can be used multiple times). Supports strings, booleans, arrays, and empty values.",
        variadic: true,
      }),
    )
    .action(
      actionWithErrorHandler(
        async (
          playbookId: string,
          serverName: string,
          options: {
            attribute?: string[];
          },
        ) => {
          if (!options.attribute || options.attribute.length === 0) {
            throw new Error(
              "No attributes specified. Use -a key=value to set attributes.",
            );
          }

          const attributes = parseKeyValueAttributes(options.attribute);

          if (playbookId && !serverName) {
            console.log(
              `updating playbook '${playbookId}' with attributes`,
              attributes,
            );
            const updatedPlaybook = await gatewayClient.store.update.mutate({
              playbookId: playbookId,
              attributes,
            });
            printPlaybookDetails(updatedPlaybook);
          } else if (playbookId && serverName) {
            console.log(
              `updating playbook server '${playbookId} > ${serverName}' with attributes`,
              attributes,
            );
            const updatedServer = await gatewayClient.store.updateServer.mutate(
              {
                playbookId: playbookId,
                serverName,
                attributes,
              },
            );
            printTargetDetails(playbookId, updatedServer);
          } else {
            throw new Error(
              "<playbookId> or <playbookId> <serverName> is required",
            );
          }
        },
      ),
    );
}

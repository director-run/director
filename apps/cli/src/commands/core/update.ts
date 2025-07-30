import { parseKeyValueAttributes } from "@director.run/utilities/cli/attribute-parser";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../../client";

export function registerUpdateCommand(program: DirectorCommand) {
  return program
    .command("update <proxyId> [serverName]")
    .description("Update proxy attributes")
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
          proxyId: string,
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

          if (proxyId && !serverName) {
            console.log("updating proxy", proxyId);
            const updatedProxy = await gatewayClient.store.updateServer.mutate({
              proxyId,
              serverName,
              attributes,
            });
            console.log("updated proxy", updatedProxy);
          } else if (proxyId && serverName) {
            console.log("updating proxy target", proxyId, serverName);
            const updatedServer = await gatewayClient.store.updateServer.mutate(
              {
                proxyId,
                serverName,
                attributes,
              },
            );
            console.log("updated server", updatedServer);
          } else {
            throw new Error("<proxyId> or <proxyId> <serverName> is required");
          }
        },
      ),
    );
}

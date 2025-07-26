import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../../client";

export function registerUpdateCommand(program: DirectorCommand) {
  return program
    .command("update <proxyId>")
    .description("Update proxy attributes")
    .addOption(
      makeOption({
        flags: "-a,--attribute <key=value>",
        description:
          "set attribute in key=value format (can be used multiple times)",
        variadic: true,
      }),
    )
    .action(
      actionWithErrorHandler(
        async (
          proxyId: string,
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

          console.log(attributes);

          const updatedProxy = await gatewayClient.store.update.mutate({
            proxyId,
            attributes,
          });

          console.log(updatedProxy);
        },
      ),
    );
}

function parseKeyValueAttributes(
  attributeStrings: string[],
): Record<string, string> {
  const attributes: Record<string, string> = {};

  for (const attr of attributeStrings) {
    const [key, ...valueParts] = attr.split("=");
    const value = valueParts.join("="); // Rejoin in case value contains '='

    if (!value) {
      throw new Error(`Invalid attribute format: ${attr}. Expected key=value`);
    }

    attributes[key] = value;
  }

  return attributes;
}

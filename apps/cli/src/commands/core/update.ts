import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../../client";
import { printProxyDetails } from "./get";

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

          const attributes = parseKeyValueAttributes(options.attribute, {
            booleanAttributes: ["addToolPrefix", "toolPrefix"],
          });

          console.log("updating attributes", attributes);

          const updatedProxy = await gatewayClient.store.update.mutate({
            proxyId,
            attributes,
          });

          printProxyDetails(updatedProxy);
        },
      ),
    );
}

export function parseKeyValueAttributes(
  attributeStrings: string[],
  options: {
    booleanAttributes: string[];
  } = {
    booleanAttributes: [],
  },
): Record<string, string | boolean> {
  const attributes: Record<string, string | boolean> = {};

  for (const attr of attributeStrings) {
    const [key, ...valueParts] = attr.split("=");
    const value = valueParts.join("="); // Rejoin in case value contains '='

    if (!value) {
      throw new Error(`Invalid attribute format: ${attr}. Expected key=value`);
    }

    // Handle boolean values
    if (options.booleanAttributes.includes(key)) {
      if (value.toLowerCase() === "true" || value === "1") {
        attributes[key] = true;
      } else if (value.toLowerCase() === "false" || value === "0") {
        attributes[key] = false;
      } else {
        throw new Error(
          `Invalid boolean value for ${key}: ${value}. Use true/false or 1/0`,
        );
      }
    } else {
      attributes[key] = value;
    }
  }

  return attributes;
}

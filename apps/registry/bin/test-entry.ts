import { createGatewayClient } from "@director.run/gateway/client";
import { getStreamablePathForProxy } from "@director.run/gateway/helpers";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { blue, yellow } from "@director.run/utilities/cli/colors";
import { makeTable } from "@director.run/utilities/cli/index";
import { getLogger } from "@director.run/utilities/logger";
import { openUrl } from "@director.run/utilities/os";
import type { RegistryEntry } from "@director.run/utilities/schema";
import { joinURL } from "@director.run/utilities/url";
import { input, select } from "@inquirer/prompts";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { EntryCreateParams } from "../src/db/schema";
import { substituteParameters } from "../src/routers/trpc/entries-router";
import { entries } from "../src/seed/entries";

const logger = getLogger("registry-qa-test");

const GATEWAY_URL = "http://localhost:3673";

async function main() {
  const entry = entries[entries.length - 1];
  await runInteractiveTestForEntry({
    entry,
    gatewayUrl: GATEWAY_URL,
    openHomepage: true,
  });
}

main();

export async function runInteractiveTestForEntry({
  entry,
  gatewayUrl,
  openHomepage,
}: {
  entry: EntryCreateParams;
  gatewayUrl: string;
  openHomepage?: boolean;
}) {
  console.log(blue(`* TESTING ENTRY STARTED *`));

  const gatewayClient = createGatewayClient(gatewayUrl);

  console.log("");
  console.log(yellow("******************"));
  console.log(yellow("*     ENTRY      *"));
  console.log(yellow("******************"));
  console.log("");
  console.log(entry);
  console.log("");
  console.log("");
  if (openHomepage) {
    openUrl(entry.homepage);
  }

  const parameters = await promptForParameters(entry);
  const resolvedTransport = substituteParameters(entry, parameters);

  console.log("");
  console.log(yellow("******************"));
  console.log(yellow("*   TRANSPORT    *"));
  console.log(yellow("******************"));
  console.log("");
  console.log(resolvedTransport);
  console.log("");

  logger.info("reseting gateway...");
  await gatewayClient.store.purge.mutate();
  const proxy = await gatewayClient.store.create.mutate({
    name: "test-proxy",
  });
  await gatewayClient.store.addServer.mutate({
    proxyId: proxy.id,
    server: {
      name: entry.name,
      transport: resolvedTransport,
    },
  });
  logger.info("creating mcp client & listing tools...");
  const mcpClient = await SimpleClient.createAndConnectToHTTP(
    joinURL(gatewayUrl, getStreamablePathForProxy(proxy.id)),
  );

  const tools = await mcpClient.listTools();
  printTools(tools.tools);

  if (tools.tools.length === 0) {
    throw new Error("No tools found");
  }
  // Choose a tool to execute

  const toolName = await select({
    message: "select a tool to run",
    choices: tools.tools.map((tool) => {
      return {
        name: tool.name,
        value: tool.name,
        description: tool.description,
      };
    }),
  });
  console.log(yellow("******************"));
  console.log(yellow(`* TOOL CALL: ${toolName} *`));
  console.log(yellow("******************"));
  console.log("");

  const toolToRun = tools.tools.find((tool) => tool.name === toolName);
  if (!toolToRun) {
    throw new Error("Tool not found");
  }
  console.log(yellow(`* INPUT SCHEMA *`));
  console.log(toolToRun.inputSchema);
  console.log("");

  const requiredArguments = toolToRun.inputSchema.required || [];
  const argValues: Record<string, string> = {};

  console.log(yellow(`* ENTER ARGUMENTS *`));

  for (const argument of requiredArguments) {
    const answer = await input({ message: argument });
    argValues[argument] = answer;
  }

  console.log(yellow(`* EXECUTING TOOL CALL *`));

  console.log("");
  console.log(
    `calling ${toolName} with arguments: ${JSON.stringify(argValues)}`,
  );
  console.log("");

  const result = await mcpClient.callTool({
    name: toolName,
    arguments: argValues,
  });

  console.log(yellow(`* RESULT *`));
  console.log(result);
  console.log("");

  console.log(blue(`* TESTING ENTRY COMPLETED *`));
  await mcpClient.close();
}

function printTools(tools: Tool[]) {
  console.log("");
  console.log(yellow("******************"));
  console.log(yellow("*     TOOLS     *"));
  console.log(yellow("******************"));
  console.log("");

  for (const tool of tools) {
    console.log(blue(tool.name), ": ", tool?.description?.slice(0, 80));
    if (tool.inputSchema.type === "object" && tool.inputSchema.properties) {
      const table = makeTable(["property", "type", "required", "description"]);
      for (const [key, value] of Object.entries(tool.inputSchema.properties)) {
        const typedValue = value as {
          type?: string;
          description?: string;
        };
        table.push([
          key,
          typedValue?.type || "--",
          tool.inputSchema.required?.includes(key) ? yellow("yes") : "no",
          typedValue?.description || "--",
        ]);
      }
      console.log(table.toString());
    } else {
      console.log(tool.inputSchema);
    }
    console.log("");
  }
  console.log("");
  console.log("");
}

async function promptForParameters(
  entry: Pick<RegistryEntry, "parameters">,
): Promise<Record<string, string>> {
  const answers: Record<string, string> = {};

  if (!entry.parameters) {
    return {};
  }

  for (const parameter of entry.parameters) {
    const answer = await input({ message: parameter.name });
    if (!answer.length) {
      continue;
    }
    answers[parameter.name] = answer;
  }
  return answers;
}

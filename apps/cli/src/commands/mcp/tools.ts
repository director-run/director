import { HTTPClient } from "@director.run/mcp/client/http-client";
import { blue, yellow } from "@director.run/utilities/cli/colors";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { makeTable } from "@director.run/utilities/cli/index";
import { input } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { gatewayClient } from "../../client";
import { title } from "../../common";

export type TransportType = "streamable" | "sse";

/**
 * Creates an authenticated MCP client for a playbook.
 */
async function createPlaybookClient(
  playbookId: string,
  transport: TransportType = "streamable",
): Promise<Client> {
  const connectionInfo = await gatewayClient.store.getConnectionInfo.query({
    playbookId,
  });
  return HTTPClient.createAndConnectToHTTP(
    transport === "sse" ? connectionInfo.sseUrl : connectionInfo.streamableUrl,
  );
}

function transportOption() {
  return makeOption({
    flags: "--transport <type>",
    description: "Transport type to use for connection",
    defaultValue: "streamable",
    choices: ["streamable", "sse"],
  });
}

export function registerToolsCommand(program: DirectorCommand) {
  program
    .command("list-tools <playbookId>")
    .description("List tools on a playbook")
    .addOption(transportOption())
    .action(
      actionWithErrorHandler(
        async (playbookId: string, options: { transport: TransportType }) => {
          const client = await createPlaybookClient(
            playbookId,
            options.transport,
          );
          await printTools(client);
          await client.close();
        },
      ),
    );

  program
    .command("get-tool <playbookId> <toolName>")
    .description("Get the details of a tool")
    .addOption(transportOption())
    .action(
      actionWithErrorHandler(
        async (
          playbookId: string,
          toolName: string,
          options: { transport: TransportType },
        ) => {
          const client = await createPlaybookClient(
            playbookId,
            options.transport,
          );
          await printTool(client, toolName);
          await client.close();
        },
      ),
    );

  program
    .command("call-tool <playbookId> <toolName>")
    .addOption(
      makeOption({
        flags: "-a,--argument <key=value>",
        description:
          "set arguments in key=value format (can be used multiple times)",
        variadic: true,
      }),
    )
    .addOption(transportOption())
    .description("Call a tool on a playbook")
    .action(
      actionWithErrorHandler(
        async (
          playbookId: string,
          toolName: string,
          options: { transport: TransportType },
        ) => {
          const client = await createPlaybookClient(
            playbookId,
            options.transport,
          );
          await callTool(client, toolName);
          await client.close();
        },
      ),
    );
}

async function printTools(client: Client) {
  console.log("");
  console.log(title("tools"));
  console.log("");

  const { tools } = await client.listTools();

  if (tools.length === 0) {
    console.log(yellow("no tools found"));
    return;
  }

  console.log(makeToolTable(tools).toString());
  console.log("");
}

export function makeToolTable(tools: Tool[]) {
  const table = makeTable(["name", "required args?", "description"]);

  for (const tool of tools) {
    table.push([
      tool.name,
      (tool.inputSchema.required?.length ?? 0) > 0 ? yellow("yes") : "no",
      tool?.description?.slice(0, 80),
    ]);
  }
  return table;
}

async function printTool(client: Client, toolName: string) {
  const { tools } = await client.listTools();

  const tool = tools.find((tool) => tool.name === toolName);

  if (!tool) {
    throw new Error("Tool not found");
  }

  console.log();
  console.log(blue(tool.name));
  console.log(tool?.description);
  console.log();

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
  console.log();
}

async function callTool(client: Client, toolName: string) {
  console.log(yellow("******************"));
  console.log(yellow(`* TOOL CALL: ${toolName} *`));
  console.log(yellow("******************"));
  console.log("");
  const { tools } = await client.listTools();
  const toolToRun = tools.find((tool) => tool.name === toolName);

  if (!toolToRun) {
    console.log(yellow("Tool not found"));
    return;
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

  const result = await client.callTool({
    name: toolName,
    arguments: argValues,
  });

  console.log(yellow(`* RESULT *`));
  console.log(result);
  console.log("");
}

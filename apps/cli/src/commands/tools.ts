import { HTTPClient } from "@director.run/mcp/client/http-client";
import { blue, yellow } from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { makeTable } from "@director.run/utilities/cli/index";
import { joinURL } from "@director.run/utilities/url";
import { input } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { env } from "../env";

export function registerToolsCommands(program: DirectorCommand): void {
  const command = new DirectorCommand("tools").description(
    "Get, list and call tools on a proxy or a target",
  );
  program.addCommand(command);

  command
    .command("ls <proxyId>")
    .alias("list")
    .description("List tools on a proxy")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const client = await HTTPClient.createAndConnectToHTTP(
          joinURL(env.GATEWAY_URL, `${proxyId}/mcp`),
        );

        await printTools(client);
        await client.close();
      }),
    );

  command
    .command("call <proxyId> <toolName>")
    .description("Call a tool on a proxy")
    .action(
      actionWithErrorHandler(async (proxyId: string, toolName: string) => {
        const client = await HTTPClient.createAndConnectToHTTP(
          joinURL(env.GATEWAY_URL, `${proxyId}/mcp`),
        );
        await callTool(client, toolName);
        await client.close();
      }),
    );
}

async function printTools(client: Client) {
  console.log("");
  console.log(yellow("******************"));
  console.log(yellow("*     TOOLS     *"));
  console.log(yellow("******************"));
  console.log("");

  const { tools } = await client.listTools();

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

async function callTool(client: Client, toolName: string) {
  console.log(yellow("******************"));
  console.log(yellow(`* TOOL CALL: ${toolName} *`));
  console.log(yellow("******************"));
  console.log("");
  const { tools } = await client.listTools();
  const toolToRun = tools.find((tool) => tool.name === toolName);

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

  const result = await client.callTool({
    name: toolName,
    arguments: argValues,
  });

  console.log(yellow(`* RESULT *`));
  console.log(result);
  console.log("");
}

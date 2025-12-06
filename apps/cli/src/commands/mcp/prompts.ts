import { HTTPClient } from "@director.run/mcp/client/http-client";
import { yellow } from "@director.run/utilities/cli/colors";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { makeTable } from "@director.run/utilities/cli/index";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Prompt } from "@modelcontextprotocol/sdk/types.js";
import { gatewayClient } from "../../client";
import { title } from "../../common";
import type { TransportType } from "./tools";

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

export function registerPromptsCommand(program: DirectorCommand) {
  program
    .command("list-prompts <playbookId>")
    .description("List prompts on a playbook")
    .addOption(transportOption())
    .action(
      actionWithErrorHandler(
        async (playbookId: string, options: { transport: TransportType }) => {
          const client = await createPlaybookClient(
            playbookId,
            options.transport,
          );
          await printPrompts(client);
          await client.close();
        },
      ),
    );
}

async function printPrompts(client: Client) {
  console.log("");
  console.log(title("prompts"));
  console.log("");

  const { prompts } = await client.listPrompts();

  if (prompts.length === 0) {
    console.log(yellow("no prompts found"));
    return;
  }

  console.log(makePromptsTable(prompts).toString());
  console.log("");
}

function makePromptsTable(prompts: Prompt[]) {
  const table = makeTable(["name", "title", "description"]);

  for (const prompt of prompts) {
    table.push([prompt.name, prompt.title, prompt.description?.slice(0, 80)]);
  }
  return table;
}

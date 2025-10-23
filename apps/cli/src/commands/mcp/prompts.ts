import { HTTPClient } from "@director.run/mcp/client/http-client";
import { yellow } from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { makeTable } from "@director.run/utilities/cli/index";
import { joinURL } from "@director.run/utilities/url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Prompt } from "@modelcontextprotocol/sdk/types.js";
import { title } from "../../common";
import { getGatewayBaseUrl } from "../../config";

export function registerPromptsCommand(program: DirectorCommand) {
  program
    .command("list-prompts <playbookId>")
    .description("List prompts on a playbook")
    .action(
      actionWithErrorHandler(async (playbookId: string) => {
        const client = await HTTPClient.createAndConnectToHTTP(
          joinURL(getGatewayBaseUrl(), `${playbookId}/mcp`),
        );

        await printPrompts(client);
        await client.close();
      }),
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

import { createGatewayClient, type GatewayClient } from "@director.run/gateway/client";
import { getStreamablePathForProxy } from "@director.run/gateway/helpers";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { blue, whiteBold, yellow } from "@director.run/utilities/cli/colors";
import { makeTable } from "@director.run/utilities/cli/index";
import { getLogger } from "@director.run/utilities/logger";
import { joinURL } from "@director.run/utilities/url";
import { input } from "@inquirer/prompts";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { EntryCreateParams, EntryGetParams } from "../db/schema";
import { parseParameters } from "../enrichment/parse-parameters";
import { interpolateParameters } from "../routers/trpc/entries-router";


const logger = getLogger("registry-qa-test");

export async function getMCPClientForEntry({entry, gatewayUrl}: {
    entry: EntryCreateParams,
    gatewayUrl: string
}): Promise<SimpleClient> {
    const gatewayClient = createGatewayClient(gatewayUrl);

    const enrichedEntry = { ...entry, parameters: parseParameters(entry) };
    console.log("");
    console.log("");
    console.log(enrichedEntry);
    console.log("");
    console.log("");
    const parameters = await promptForParameters(enrichedEntry);
    const resolvedTransport = interpolateParameters(enrichedEntry, parameters);
  
    logger.info("reseting gateway...");
    await gatewayClient.store.purge.mutate();
    const proxy = await gatewayClient.store.create.mutate({
      name: "test-proxy",
    });
    await gatewayClient.store.addServer.mutate({
      proxyId: proxy.id,
      server: {
        name: "brave-search",
        transport: resolvedTransport,
      },
    });
    logger.info("creating mcp client & listing tools...");
    const mcpClient = await SimpleClient.createAndConnectToHTTP(
      joinURL(gatewayUrl, getStreamablePathForProxy(proxy.id)),
    );


    const tools = await mcpClient.listTools();
    printTools(tools.tools);
  
    return mcpClient;
  }
  

function printTools(tools: Tool[]) {
    console.log("");
    console.log(whiteBold("TOOLS"));
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
    entry: Pick<EntryGetParams, "parameters">,
  ): Promise<Record<string, string>> {
    const answers: Record<string, string> = {};
  
    if (!entry.parameters) {
      return {};
    }
  
    for (const parameter of entry.parameters) {
      const answer = await input({ message: parameter.name });
      answers[parameter.name] = answer;
    }
  
    return answers;
  }
  
import { createGatewayClient } from "@director.run/gateway/client";
import { getStreamablePathForProxy } from "@director.run/gateway/helpers";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { whiteBold } from "@director.run/utilities/cli/colors";
import { getLogger } from "@director.run/utilities/logger";
import { joinURL } from "@director.run/utilities/url";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { EntryCreateParams } from "../src/db/schema";
import { entries } from "../src/seed/entries";

const GATEWAY_URL = "http://reg.local:3673";

const logger = getLogger("registry-qa-test");
const gatewayClient = createGatewayClient(GATEWAY_URL);

await runTests();

async function runTests() {
  const mcpClient = await setupTestForEntry(entries[0]);
  const tools = await mcpClient.listTools();
  printTools(tools.tools);

  logger.info("calling tool...");

  //   const result = await mcpClient.callTool({
  //     name: "brave_web_search",
  //     arguments: {
  //       query: "What is the capital of France?",
  //     },
  //   });
  //   console.log("result", result);

  await mcpClient.close();
}

function printTools(tools: Tool[]) {
  console.log("");
  console.log(whiteBold("TOOLS"));
  console.log("");

  for (const tool of tools) {
    console.log(tool.name, " - ", tool?.description?.slice(0, 30));
    console.log(tool.inputSchema);
    console.log("--");
  }
  console.log("");
  console.log("");
}

async function setupTestForEntry(
  entry: EntryCreateParams,
): Promise<SimpleClient> {
  logger.info("reseting gateway...");
  await gatewayClient.store.purge.mutate();
  const proxy = await gatewayClient.store.create.mutate({
    name: "test-proxy",
  });
  await gatewayClient.store.addServer.mutate({
    proxyId: proxy.id,
    server: {
      name: "brave-search",
      transport: entry.transport,
    },
  });
  logger.info("creating mcp client & listing tools...");
  return await SimpleClient.createAndConnectToHTTP(
    joinURL(GATEWAY_URL, getStreamablePathForProxy(proxy.id)),
  );
}

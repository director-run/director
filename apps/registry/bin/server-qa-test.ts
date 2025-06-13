import { createGatewayClient } from "@director.run/gateway/client";
import { getStreamablePathForProxy } from "@director.run/gateway/helpers";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { getLogger } from "@director.run/utilities/logger";
import { joinURL } from "@director.run/utilities/url";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
// import type { EntryCreateParams } from "../src/db/schema";
import { entries } from "../src/seed/entries";

const GATEWAY_URL = "http://reg.local:3673";

const logger = getLogger("registry-qa-test");
const gatewayClient = createGatewayClient(GATEWAY_URL);

await runTests();

async function runTests() {
  logger.info("reseting gateway...");
  await gatewayClient.store.purge.mutate();
  const proxy = await gatewayClient.store.create.mutate({
    name: "test-proxy",
  });
  await gatewayClient.store.addServer.mutate({
    proxyId: proxy.id,
    server: {
      name: "brave-search",
      transport: entries[0].transport,
    },
  });
  logger.info("creating mcp client & listing tools...");
  const mcpClient = await SimpleClient.createAndConnectToHTTP(
    joinURL(GATEWAY_URL, getStreamablePathForProxy(proxy.id)),
  );

  const tools = await mcpClient.listTools();
  printTools(tools.tools);

  logger.info("calling tool...");

  const result = await mcpClient.callTool({
    name: "brave_web_search",
    arguments: {
      query: "What is the capital of France?",
    },
  });
  console.log("result", result);

  await mcpClient.close();
}

function printTools(tools: Tool[]) {
  for (const tool of tools) {
    console.log(tool.name);
    console.log(tool.description);
    console.log(tool.inputSchema);
  }
}

import { createGatewayClient } from "@director.run/gateway/client";
import { getStreamablePathForProxy } from "@director.run/gateway/helpers";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { joinURL } from "@director.run/utilities/url";
// import type { EntryCreateParams } from "../src/db/schema";
import { entries } from "../src/seed/entries";

const GATEWAY_URL = "http://reg.local:3673";

export const gatewayClient = createGatewayClient(GATEWAY_URL);

await runTests();

async function runTests() {
  console.log("Running tests...");
  await resetSuite();
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
  console.log(await gatewayClient.store.getAll.query());
  const mcpClient = await SimpleClient.createAndConnectToHTTP(
    joinURL(GATEWAY_URL, getStreamablePathForProxy(proxy.id)),
  );
  console.log(await mcpClient.listTools());
  await mcpClient.close();
}

async function resetSuite() {
  console.log("resetting suite...");
  await gatewayClient.store.purge.mutate();
}

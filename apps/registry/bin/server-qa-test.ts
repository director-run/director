import { createGatewayClient } from "@director.run/gateway/client";
import { getStreamablePathForProxy } from "@director.run/gateway/helpers";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { blue, whiteBold, yellow } from "@director.run/utilities/cli/colors";
import { makeTable } from "@director.run/utilities/cli/index";
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
    console.log(blue(tool.name), ": ", tool?.description?.slice(0, 80));
    if (tool.inputSchema.type === "object" && tool.inputSchema.properties) {
      const table = makeTable(["property", "type", "required", "description"]);
      for (const [key, value] of Object.entries(tool.inputSchema.properties)) {
        table.push([
          key,
          value?.type || "--",
          tool.inputSchema.required?.includes(key) ? yellow("yes") : "no",
          value?.description || "--",
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

// Slack
// Notion
// Github
// Google Workspace
// - Email
// - Calenda
// Postgres
// Dropbox?
// Terminal
// Google Drive
// Google Calendar
// Stripe
// Obsidian
// Filesystem
// A browser one
// Google Maps
// Fetch - Web content fetching and conversion for efficient LLM usage (--ignore-robots-txt)
// Filesystem - Secure file operations with configurable access controls
// Git - Tools to read, search, and manipulate Git repositories
// Memory - Knowledge graph-based persistent memory system
// Sequential Thinking - Dynamic and reflective problem-solving through thought sequences
// Time - Time and timezone conversion capabilities

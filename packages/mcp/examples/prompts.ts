import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  GetPromptResult,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { serveOverStreamable } from "../src/transport";

async function main() {
  const server = new McpServer(
    {
      name: "simple-streamable-http-server",
      version: "1.0.0",
    },
    { capabilities: { logging: {} } },
  );

  server.registerTool(
    "greet",
    {
      title: "Greeting Tool", // Display name for UI
      description: "A simple greeting tool",
      inputSchema: {
        name: z.string().describe("Name to greet"),
      },
    },
    async ({ name }): Promise<CallToolResult> => {
      return await {
        content: [
          {
            type: "text",
            text: `Hello, ${name}!`,
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "greeting-template",
    {
      title: "Greeting Template", // Display name for UI
      description: "A simple greeting prompt template",
      argsSchema: {
        name: z.string().describe("Name to include in greeting"),
      },
    },
    async ({ name }): Promise<GetPromptResult> => {
      return await {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please greet ${name} in a friendly manner.`,
            },
          },
        ],
      };
    },
  );

  await serveOverStreamable(server.server, 9001);
}

main();

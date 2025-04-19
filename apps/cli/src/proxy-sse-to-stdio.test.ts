import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { z } from "zod";
import { createMCPServer } from "../../backend/src/helpers/test-helpers";

describe("proxySSEToStdio", () => {
  let client: Client;
  let transport: StdioClientTransport;
  let proxyTargetServerInstance: Server;

  beforeAll(async () => {
    proxyTargetServerInstance = await createMCPServer(4522, (server) => {
      server.tool("echo", { message: z.string() }, async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      }));
    });
    client = new Client(
      {
        name: "test-client",
        version: "0.0.0",
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      },
    );

    transport = new StdioClientTransport({
      command: "bun",
      args: ["cli", "sse2stdio", "http://localhost:4522/sse"],
      env: {
        ...process.env,
        LOG_LEVEL: "silent",
        NODE_ENV: "test",
      },
    });

    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    await client?.close();
    await proxyTargetServerInstance?.close();
  });

  test("should connect and list tools", async () => {
    const toolsResult = await client.listTools();

    const expectedToolNames = ["echo"];

    for (const toolName of expectedToolNames) {
      const tool = toolsResult.tools.find((t) => t.name === toolName);
      expect(tool).toBeDefined();
      expect(tool?.name).toBe(toolName);
    }
  });
});

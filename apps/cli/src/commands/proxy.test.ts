import type { Server } from "node:http";
import path from "node:path";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { makeEchoServer } from "@director.run/mcp/test/fixtures";
import { serveOverSSE } from "@director.run/mcp/transport";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe("sse2stdio <sse_url>", () => {
  let client: Client;
  let proxyTargetServerInstance: Server;

  beforeAll(async () => {
    proxyTargetServerInstance = await serveOverSSE(makeEchoServer(), 4522);

    client = await SimpleClient.createAndConnectToStdio(
      "bun",
      [
        path.join(__dirname, "../../bin/cli"),
        "sse2stdio",
        "http://localhost:4522/sse",
      ],
      {
        ...process.env,
        LOG_LEVEL: "silent",
        NODE_ENV: "test",
      },
    );
  }, 30000);

  afterAll(async () => {
    await client?.close();
    await proxyTargetServerInstance?.close();
  });

  test("should proxy an SSE server to stdio", async () => {
    const toolsResult = await client.listTools();

    const expectedToolNames = ["echo"];

    for (const toolName of expectedToolNames) {
      const tool = toolsResult.tools.find((t) => t.name === toolName);
      expect(tool).toBeDefined();
      expect(tool?.name).toBe(toolName);
    }
  });
});

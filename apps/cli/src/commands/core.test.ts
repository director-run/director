import type { Server } from "node:http";
import path from "node:path";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import { makeEchoServer } from "@director.run/mcp/test/fixtures";
import { serveOverSSE } from "@director.run/mcp/transport";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe("sse2stdio <sse_url>", () => {
  let client: StdioClient;
  let proxyTargetServerInstance: Server;

  beforeAll(async () => {
    proxyTargetServerInstance = await serveOverSSE(makeEchoServer(), 4522);

    client = await StdioClient.createAndConnectToStdio(
      "bun",
      [
        path.join(__dirname, "../../bin/cli"),
        "http2stdio",
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

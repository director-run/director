import type { Server } from "http";
import path from "path";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { SimpleClient } from "./simple-client";
import { SimpleServer } from "./simple-server";
import { makeEchoServer } from "./test/fixtures";
import { serveOverSSE, serveOverStreamable } from "./transport";

describe("transport", () => {
  describe("serveOverStreamable", () => {
    let httpServer: Server;
    let mcpServer: SimpleServer;

    beforeAll(async () => {
      mcpServer = makeEchoServer();
      httpServer = await serveOverStreamable(mcpServer, 2345);
    });

    afterAll(async () => {
      await httpServer.close();
      await mcpServer.close();
    });

    test("should create a server with a tool", async () => {
      const client = await SimpleClient.createAndConnectToStreamable(
        "http://localhost:2345/mcp",
      );

      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
    });
  });

  describe("serveOverStdio", () => {
    test("should expose a server over stdio", async () => {
      const basePath = __dirname;
      const client = await SimpleClient.createAndConnectToStdio("bun", [
        "-e",
        `
            import { makeEchoServer } from '${path.join(basePath, "test/fixtures.ts")}'; 
            import { serveOverStdio } from '${path.join(basePath, "transport.ts")}'; 
            serveOverStdio(makeEchoServer());
        `,
      ]);
      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
    });
  });

  describe("serveOverSSE", () => {
    test("should expose a server over stdio", async () => {
      const server = makeEchoServer();
      const app = serveOverSSE(server, 3000);
      const client = await SimpleClient.createAndConnectToSSE(
        `http://localhost:3000/sse`,
      );
      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
    });
  });

  describe("proxySSEToStdio", () => {
    let client: Client;
    let proxyTargetServerInstance: Server;

    beforeAll(async () => {
      proxyTargetServerInstance = await serveOverSSE(makeEchoServer(), 4522);
      const basePath = __dirname;
      client = await SimpleClient.createAndConnectToStdio("bun", [
        "-e",
        `
            import { proxySSEToStdio } from '${path.join(basePath, "transport.ts")}'; 
            proxySSEToStdio("http://localhost:4522/sse");
        `,
      ]);
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
});

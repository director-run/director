import { describe, expect, test } from "vitest";
import { ProxyServer } from "./proxy-server";
import { SimpleClient } from "./simple-client";
import {
  makeEchoServer,
  makeFooBarServer,
  makeHTTPTargetConfig,
} from "./test/fixtures";
import { serveOverSSE, serveOverStreamable } from "./transport";

describe("ProxyServer", () => {
  describe("with a controller", () => {
    test("should expose controller tools via the proxy", async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [],
        useController: true,
      });
      await proxy.connectTargets();

      const client = await SimpleClient.createAndConnectToServer(proxy);
      const tools = await client.listTools();

      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("list_targets");
    });
  });

  test("should handle all transports", async () => {
    const streamableServerInstance = await serveOverStreamable(
      makeEchoServer(),
      4522,
    );
    const sseServerInstance = await serveOverSSE(makeFooBarServer(), 4523);

    const proxy = new ProxyServer({
      id: "test-proxy",
      name: "test-proxy",
      servers: [
        makeHTTPTargetConfig({
          name: "streamable",
          url: `http://localhost:4522/mcp`,
        }),
        makeHTTPTargetConfig({ name: "sse", url: `http://localhost:4523/sse` }),
      ],
    });

    await proxy.connectTargets();

    const client = await SimpleClient.createAndConnectToServer(proxy);
    const tools = await client.listTools();

    expect(tools.tools).toHaveLength(2);
    expect(tools.tools.some((tool) => tool.name === "echo")).toBe(true);
    expect(tools.tools.some((tool) => tool.name === "foo")).toBe(true);
  });
});

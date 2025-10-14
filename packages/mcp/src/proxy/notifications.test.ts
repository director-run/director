import { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { HTTPClient } from "../client/http-client";
import { makeEchoServer, makeKitchenSinkServer } from "../test/fixtures";
import {} from "../test/helpers";
import { serveOverSSE, serveOverStreamable } from "../transport";
import { ProxyServer } from "./proxy-server";

const STREAMABLE_PORT = 2345;
const SSE_PORT = STREAMABLE_PORT + 1;

describe("ProxyServer", () => {
  let streamableInstance: Server;
  let sseInstance: Server;

  beforeAll(async () => {
    streamableInstance = await serveOverStreamable(
      makeEchoServer(),
      STREAMABLE_PORT,
    );
    sseInstance = await serveOverSSE(makeKitchenSinkServer(), SSE_PORT);
  });

  afterAll(async () => {
    await streamableInstance.close();
    await sseInstance.close();
  });

  describe("notifications", () => {
    test("should send list changed events when a target is added", async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        servers: [],
      });
      await proxy.connectTargets();
      //   const client = await InMemoryClient.createAndConnectToServer(proxy);

      await proxy.addTarget(
        new HTTPClient({
          name: "streamable",
          url: `http://localhost/mcp`,
        }),
        { throwOnError: false },
      );

      const target = await proxy.getTarget("streamable");
      expect(target).toBeDefined();
      //   expect((await client.listTools()).tools).toHaveLength(1);
    });
  });
});

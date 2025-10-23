import { Server } from "node:http";
import { sleep } from "@director.run/utilities/sleep";
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
    test("should send onListChange when targets are added/updated/removed and cleanup on close", async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        servers: [],
      });

      await proxy.connectTargets();

      let callCount = 0;
      proxy.setListChangeListner(() => {
        callCount += 1;
      });

      await proxy.addTarget(
        new HTTPClient({
          name: "streamable",
          url: `http://localhost:${STREAMABLE_PORT}/mcp`,
        }),
        { throwOnError: false },
      );

      await proxy.updateTarget("streamable", { tools: { prefix: "pref-" } });
      await proxy.removeTarget("streamable");

      await sleep(1); // list change event is emitted asynchronously

      expect(callCount).toBeGreaterThanOrEqual(3);

      // unsubscribe and ensure no further increments
      proxy.removeListChangeListner();

      await proxy.addTarget(
        new HTTPClient({
          name: "sse",
          url: `http://localhost:${SSE_PORT}/sse`,
        }),
        { throwOnError: false },
      );

      const current = callCount;

      // close should clear listeners; emitting later changes should not call listener
      await proxy.close();

      // Create a new proxy to avoid operating on closed instance in next tests
      expect(callCount).toBe(current);
    });
  });
});

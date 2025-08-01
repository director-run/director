import { InMemoryClient } from "@director.run/mcp/client/in-memory-client";
import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import {
  makeEchoServer,
  makeHTTPTargetConfig,
} from "@director.run/mcp/test/fixtures";
import { beforeAll, describe, expect, test } from "vitest";
import { serializeProxyServer } from "./serializers";

describe("serializers", () => {
  describe("serializeProxyServer", () => {
    let proxy: ProxyServer;

    beforeAll(async () => {
      proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          makeHTTPTargetConfig({
            name: "streamable",
            url: `http://localhost:4522/mcp`,
          }),
          makeHTTPTargetConfig({
            name: "sse",
            url: `http://localhost:4523/sse`,
          }),
        ],
      });
      await proxy.addTarget(
        new InMemoryClient({
          name: "prompt-store",
          server: makeEchoServer(),
        }),
      );
    });

    test("should not include the in-memory targets by default", async () => {
      const serializedProxies = await serializeProxyServer(proxy);
      expect(serializedProxies.targets).toHaveLength(2);
      expect(serializedProxies.targets).not.toContainEqual(
        expect.objectContaining({ name: "prompt-store" }),
      );
      const serializedProxiesWithMem = await serializeProxyServer(proxy, {
        includeInMemoryTargets: true,
      });
      expect(serializedProxiesWithMem.targets).toHaveLength(3);
      expect(serializedProxiesWithMem.targets).toContainEqual(
        expect.objectContaining({ name: "prompt-store" }),
      );
    });

    test("should properly serialize the proxy server attributes", async () => {
      const plainObject = await serializeProxyServer(proxy);
      expect(plainObject).toMatchObject({
        id: "test-proxy",
        name: "test-proxy",
        targets: [
          {
            name: "streamable",
            status: "disconnected",
            lastConnectedAt: undefined,
            lastErrorMessage: undefined,
            transport: {
              type: "http",
              url: `http://localhost:4522/mcp`,
            },
          },
          {
            name: "sse",
            status: "disconnected",
            lastConnectedAt: undefined,
            lastErrorMessage: undefined,
            transport: {
              type: "http",
              url: `http://localhost:4523/sse`,
            },
          },
        ],
      });
    });
  });
});

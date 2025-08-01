import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import { makeHTTPTargetConfig } from "@director.run/mcp/test/fixtures";
import { describe, expect, test } from "vitest";
import { serializeProxyServer } from "./serializers";

describe("serializers", () => {
  describe("serializeProxyServer", () => {
    test("should properly serialize the proxy server attributes", async () => {
      const proxy = new ProxyServer({
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

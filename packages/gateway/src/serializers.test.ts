import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import { makeHTTPTargetConfig } from "@director.run/mcp/test/fixtures";
import { describe, expect, test } from "vitest";
import { serializeProxyServer } from "./serializers";

describe("serializers", () => {
  describe("serializeProxyServer", () => {
    test("should properly serialize the proxy server attributes", () => {
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

      const plainObject = serializeProxyServer(proxy);
      expect(plainObject).toMatchObject({
        id: "test-proxy",
        name: "test-proxy",
        targets: [
          {
            name: "streamable",
            command: `http://localhost:4522/mcp`,
            status: "disconnected",
            lastConnectedAt: undefined,
            lastErrorMessage: undefined,
            type: "http",
          },
          {
            name: "sse",
            command: `http://localhost:4523/sse`,
            status: "disconnected",
            lastConnectedAt: undefined,
            lastErrorMessage: undefined,
            type: "http",
          },
        ],
      });
    });
  });
});

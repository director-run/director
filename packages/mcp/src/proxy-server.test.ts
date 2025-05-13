import { describe, expect, test } from "vitest";
import { ProxyServer } from "./proxy-server";
import { SimpleClient } from "./simple-client";

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
});

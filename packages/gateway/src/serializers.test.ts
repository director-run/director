import { beforeAll, describe, expect, test } from "vitest";
import { PROMPT_MANAGER_TARGET_NAME } from "./capabilities/prompt-manager";
import { serializeProxyServer } from "./serializers";
import { Workspace } from "./workspaces/workspace";

describe("serializers", () => {
  describe("serializeProxyServer", () => {
    let proxy: Workspace;

    beforeAll(() => {
      proxy = new Workspace({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            name: "streamable",
            type: "http",
            url: `http://localhost:4522/mcp`,
          },
          {
            name: "sse",
            type: "http",
            url: `http://localhost:4523/sse`,
          },
        ],
      });
    });

    test("should not include the in-memory targets by default", async () => {
      const serializedProxies = await serializeProxyServer(proxy);
      expect(serializedProxies.targets).toHaveLength(2);
      expect(serializedProxies.targets).not.toContainEqual(
        expect.objectContaining({ name: PROMPT_MANAGER_TARGET_NAME }),
      );
      const serializedProxiesWithMem = await serializeProxyServer(proxy, {
        includeInMemoryTargets: true,
      });
      expect(serializedProxiesWithMem.targets).toHaveLength(3);
      expect(serializedProxiesWithMem.targets).toContainEqual(
        expect.objectContaining({ name: PROMPT_MANAGER_TARGET_NAME }),
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

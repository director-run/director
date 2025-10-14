import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IntegrationTestHarness } from "../../test/integration";

describe("Client Router", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("allClients", () => {
    it("should return all client statuses without proxyId", async () => {
      const result = await harness.client.clients.allClients.query();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      for (const client of result) {
        expect(client).toHaveProperty("name");
        expect(client).toHaveProperty("installed");
        expect(client).toHaveProperty("configExists");
        expect(client).toHaveProperty("configPath");
        expect(typeof client.name).toBe("string");
        expect(typeof client.installed).toBe("boolean");
        expect(typeof client.configExists).toBe("boolean");
        expect(typeof client.configPath).toBe("string");
      }

      // Verify that workspace names are correctly derived from underlying installer list()
      // expect(client).toHaveProperty("workspaces");
      // expect(Array.isArray(client.workspaces)).toBe(true);
      // const workspaceIds = client.workspaces.map((w: { id: string }) => w.id);
      // expect(workspaceIds).toEqual(
      //   expect.arrayContaining(["test-workspace-123", "test-workspace-456"]),
      // );
    });
  });
  describe("byProxy", () => {
    it("should return proxy-specific installation status", async () => {
      const testProxyId = "test-workspace-456";

      const result = await harness.client.clients.byProxy.list.query({
        proxyId: testProxyId,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");

      // Result should be a Record of ConfiguratorTarget -> boolean
      expect(result).toHaveProperty("claude");
      expect(result).toHaveProperty("cursor");
      expect(result).toHaveProperty("vscode");
      expect(typeof result.claude).toBe("boolean");
      expect(typeof result.cursor).toBe("boolean");
      expect(typeof result.vscode).toBe("boolean");
    });
  });
});

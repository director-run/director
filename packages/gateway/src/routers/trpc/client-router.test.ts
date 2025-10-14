import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { IntegrationTestHarness } from "../../test/integration";

vi.mock("@director.run/client-configurator/index", () => ({
  getAllClients: vi.fn(async () => [
    {
      name: "claude",
      installed: true,
      configExists: true,
      configPath: "/mock/path/claude",
      workspaces: [{ id: "test-workspace-123" }, { id: "test-workspace-456" }],
    },
    {
      name: "claude-code",
      installed: true,
      configExists: true,
      configPath: "/mock/path/claude-code",
      workspaces: [{ id: "test-workspace-hi" }],
    },
    {
      name: "cursor",
      installed: false,
      configExists: false,
      configPath: "/mock/path/cursor",
      workspaces: [],
    },
  ]),
  getProxyInstalledStatus: vi.fn(async () => ({
    claude: true,
    cursor: false,
    vscode: false,
    "claude-code": false,
  })),
  getConfigurator: vi.fn(),
  ConfiguratorTarget: {
    Claude: "claude",
    Cursor: "cursor",
    VSCode: "vscode",
    ClaudeCode: "claude-code",
  },
}));

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

      const claudeClient = result.find((c) => c.name === "claude");
      expect(claudeClient).toBeDefined();

      expect(claudeClient?.workspaces?.map((w) => w.id)).toEqual(
        expect.arrayContaining(["test-workspace-123", "test-workspace-456"]),
      );

      const claudeCodeClient = result.find((c) => c.name === "claude-code");
      expect(claudeCodeClient).toBeDefined();

      expect(claudeCodeClient?.workspaces?.map((w) => w.id)).toEqual(
        expect.arrayContaining(["test-workspace-hi"]),
      );
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

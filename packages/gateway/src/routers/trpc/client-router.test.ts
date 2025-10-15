import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IntegrationTestHarness } from "../../test/integration";

// vi.mock("@director.run/client-configurator/index", () => ({
//   getAllClients: vi.fn(async () => [
//     {
//       name: "claude",
//       installed: true,
//       configExists: true,
//       configPath: "/mock/path/claude",
//       workspaces: [{ id: "test-workspace-123" }, { id: "test-workspace-456" }],
//     },
//     {
//       name: "claude-code",
//       installed: true,
//       configExists: true,
//       configPath: "/mock/path/claude-code",
//       workspaces: [{ id: "test-workspace-hi" }],
//     },
//     {
//       name: "cursor",
//       installed: false,
//       configExists: false,
//       configPath: "/mock/path/cursor",
//       workspaces: [],
//     },
//   ]),
//   getProxyInstalledStatus: vi.fn(async () => ({
//     claude: true,
//     cursor: false,
//     vscode: false,
//     "claude-code": false,
//   })),
//   getConfigurator: vi.fn(),
//   ConfiguratorTarget: {
//     Claude: "claude",
//     Cursor: "cursor",
//     VSCode: "vscode",
//     ClaudeCode: "claude-code",
//   },
// }));

describe("Client Router", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("allClients", () => {
    it.skip("should return all client statuses without proxyId", async () => {
      const result = await harness.client.clients.allClients.query();

      expect(result.length).toBeGreaterThan(0);

      result.forEach((client) => {
        expect(client).toEqual(
          expect.objectContaining({
            name: expect.any(String),
            installed: expect.any(Boolean),
            configExists: expect.any(Boolean),
            configPath: expect.any(String),
            workspaces: expect.any(Array),
          }),
        );
      });

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
});

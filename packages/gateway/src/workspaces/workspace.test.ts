import { beforeEach, describe, expect, it } from "vitest";
import { Config } from "../config";
import { makeTestConfig } from "../test/config";
import { makeFooBarServerStdioConfig } from "../test/fixtures";
import { Workspace } from "./workspace";

describe("Workspace", async () => {
  const config: Config = await makeTestConfig();
  let workspace: Workspace;

  beforeEach(async () => {
    workspace = await Workspace.fromConfig(
      {
        id: "test-workspace",
        name: "test-workspace",
        servers: [],
      },
      {
        config,
      },
    );
  });

  describe("addTarget", () => {
    it("should persist changes to the config file", async () => {
      const target = await workspace.addTarget(makeFooBarServerStdioConfig());
      expect(target.name).toBe("foo");

      expect(workspace.targets).toHaveLength(2); // 1 server + 1 prompt manager

      const workspaceEntry =
        await config.workspaces.getWorkspace("test-workspace");
      expect(workspaceEntry.servers).toHaveLength(1);
      expect(workspaceEntry.servers[0].name).toBe("foo");
    });
  });

  describe("removeTarget", () => {
    it("should persist changes to the config file", async () => {
      await workspace.addTarget(makeFooBarServerStdioConfig());

      const removedTarget = await workspace.removeTarget("foo");
      expect(workspace.targets).toHaveLength(1); // Only prompt manager remains
      expect(removedTarget.status).toBe("disconnected");

      const workspaceEntry =
        await config.workspaces.getWorkspace("test-workspace");
      expect(workspaceEntry.servers).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should persist target changes to the config", async () => {
      await workspace.addTarget(makeFooBarServerStdioConfig());
      const workspaceEntry =
        await config.workspaces.getWorkspace("test-workspace");

      expect(workspaceEntry.servers).toHaveLength(1);
      expect(workspaceEntry.servers[0].name).toBe("foo");
    });

    it("should persist workspace changes to the config", async () => {
      await workspace.addTarget(makeFooBarServerStdioConfig());
      await workspace.update({
        name: "test-workspace-updated",
        description: "test-workspace-updated",
      });
      expect(workspace.name).toBe("test-workspace-updated");
      expect(workspace.description).toBe("test-workspace-updated");

      const workspaceEntry =
        await config.workspaces.getWorkspace("test-workspace");

      expect(workspaceEntry.name).toBe("test-workspace-updated");
      expect(workspaceEntry.description).toBe("test-workspace-updated");
    });
  });
});

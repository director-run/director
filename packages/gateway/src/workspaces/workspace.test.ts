import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { YAMLConfig } from "../config";
import { makeFooBarServerStdioConfig } from "../test/fixtures";
import { Workspace } from "./workspace";

describe("Workspace", () => {
  let config: YAMLConfig;
  const dbPath = path.join(__dirname, "../test/config.test.yaml");
  let workspace: Workspace;

  beforeEach(async () => {
    if (fs.existsSync(dbPath)) {
      await fs.promises.unlink(dbPath);
    }
    config = await YAMLConfig.connect(dbPath);
    await config.purge();
    workspace = await Workspace.fromConfig(
      {
        id: "test-proxy",
        name: "test-proxy",
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

      const proxyEntry = await config.getWorkspace("test-proxy");
      expect(proxyEntry.servers).toHaveLength(1);
      expect(proxyEntry.servers[0].name).toBe("foo");
    });
  });

  describe("removeTarget", () => {
    it("should persist changes to the config file", async () => {
      await workspace.addTarget(makeFooBarServerStdioConfig());

      const removedTarget = await workspace.removeTarget("foo");
      expect(workspace.targets).toHaveLength(1); // Only prompt manager remains
      expect(removedTarget.status).toBe("disconnected");

      const db = await YAMLConfig.connect(dbPath);
      const proxyEntry = await db.getWorkspace("test-proxy");
      expect(proxyEntry.servers).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should persist changes to the config file", async () => {
      expect(workspace.addToolPrefix).toBeFalsy();

      await workspace.addTarget(makeFooBarServerStdioConfig());
      const proxy = await workspace.update({
        name: "test-proxy-updated",
        description: "test-proxy-updated",
      });
      expect(proxy.name).toBe("test-proxy-updated");
      expect(proxy.description).toBe("test-proxy-updated");

      const proxyEntry = await config.getWorkspace("test-proxy");

      expect(proxyEntry.name).toBe("test-proxy-updated");
      expect(proxyEntry.description).toBe("test-proxy-updated");
    });
  });
});

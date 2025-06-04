import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { Database } from "./db";
import { ProxyServerStore } from "./proxy-server-store";
import { makeFooBarServerStdioConfig } from "./test/fixtures";

describe("ProxyServerStore", () => {
  let proxyServerStore: ProxyServerStore;
  const dbPath = path.join(__dirname, "./test/config.test.json");

  beforeEach(async () => {
    if (fs.existsSync(dbPath)) {
      await fs.promises.unlink(dbPath);
    }
    const db = await Database.connect(dbPath);
    proxyServerStore = await ProxyServerStore.create(db);
    await proxyServerStore.create({
      name: "test-proxy",
      servers: [],
    });
  });

  describe("addServer", () => {
    it("should persist changes to the config file", async () => {
      const proxy = await proxyServerStore.addServer(
        "test-proxy",
        makeFooBarServerStdioConfig(),
      );
      expect(proxy.attributes.servers).toHaveLength(1);
      expect(proxy.attributes.servers[0].name).toBe("foo");

      const db = await Database.connect(dbPath);
      const proxyEntry = await db.getProxy("test-proxy");
      expect(proxyEntry.servers).toHaveLength(1);
      expect(proxyEntry.servers[0].name).toBe("foo");
    });
  });
  describe("removeServer", () => {
    it("should persist changes to the config file", async () => {
      await proxyServerStore.addServer(
        "test-proxy",
        makeFooBarServerStdioConfig(),
      );

      const proxy = await proxyServerStore.removeServer("test-proxy", "foo");
      expect(proxy.attributes.servers).toHaveLength(0);

      const db = await Database.connect(dbPath);
      const proxyEntry = await db.getProxy("test-proxy");
      expect(proxyEntry.servers).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should persist changes to the config file", async () => {
      await proxyServerStore.addServer(
        "test-proxy",
        makeFooBarServerStdioConfig(),
      );
      const proxy = await proxyServerStore.update("test-proxy", {
        name: "test-proxy-updated",
        description: "test-proxy-updated",
      });
      expect(proxy.attributes.name).toBe("test-proxy-updated");
      expect(proxy.attributes.description).toBe("test-proxy-updated");

      const db = await Database.connect(dbPath);
      const proxyEntry = await db.getProxy("test-proxy");

      expect(proxyEntry.name).toBe("test-proxy-updated");
      expect(proxyEntry.description).toBe("test-proxy-updated");
    });
  });
});

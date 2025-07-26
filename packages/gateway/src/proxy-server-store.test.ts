import fs from "node:fs";
import path from "node:path";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Database } from "./db";
import { ProxyServerStore } from "./proxy-server-store";
import {
  makeFooBarServerStdioConfig,
  makeHTTPTargetConfig,
} from "./test/fixtures";

describe("ProxyServerStore", () => {
  let proxyServerStore: ProxyServerStore;
  const dbPath = path.join(__dirname, "./test/config.test.json");

  beforeEach(async () => {
    if (fs.existsSync(dbPath)) {
      await fs.promises.unlink(dbPath);
    }
    const db = await Database.connect(dbPath);
    proxyServerStore = await ProxyServerStore.create({
      db,
      oAuthHandler: OAuthHandler.createMemoryBackedHandler({
        baseCallbackUrl: "http://localhost:3000/callback",
      }),
    });
    await proxyServerStore.create({
      name: "test-proxy",
      servers: [],
    });
  });

  describe("onAuthorizationSuccess", () => {
    it("should properly update the targets with the new oauth token", async () => {
      await proxyServerStore.purge();
      await proxyServerStore.create({ name: "test-proxy", servers: [] });

      const serverUrl = "https://example.com/api";
      await proxyServerStore.addServer(
        "test-proxy",
        makeHTTPTargetConfig({ name: "http1", url: serverUrl }),
        { throwOnError: false },
      );

      const httpClient = proxyServerStore
        .get("test-proxy")
        .getAllTargets()[0] as HTTPClient;
      httpClient.completeAuthFlow = vi.fn();

      await proxyServerStore.onAuthorizationSuccess(serverUrl, "some-code");

      expect(httpClient.completeAuthFlow).toHaveBeenCalledWith("some-code");
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

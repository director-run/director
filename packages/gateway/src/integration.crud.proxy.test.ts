import type { ProxyServerAttributes } from "@director.run/utilities/schema";
import { TRPCClientError } from "@trpc/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { IntegrationTestHarness } from "./test/integration";

describe("Proxy CRUD operations", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("read", () => {
    beforeAll(async () => {
      await harness.purge();
    });

    it("should get all proxies", async () => {
      expect(await harness.client.store.getAll.query()).toHaveLength(0);
      await harness.client.store.create.mutate({
        name: "Test proxy",
      });
      await harness.client.store.create.mutate({
        name: "Test proxy 2",
      });
      const proxies = await harness.client.store.getAll.query();
      expect(proxies).toHaveLength(2);

      expect(proxies[0].id).toBe("test-proxy");
      expect(proxies[1].id).toBe("test-proxy-2");
    });
  });

  describe("create", () => {
    beforeAll(async () => {
      await harness.purge();
      await harness.client.store.create.mutate({
        name: "Test proxy",
        description: "Test description",
      });
    });

    it("should add the proxy to the gateway", async () => {
      expect(await harness.client.store.getAll.query()).toHaveLength(1);
      const proxy = await harness.client.store.get.query({
        proxyId: "test-proxy",
      });
      expect(proxy).toBeDefined();
      expect(proxy?.id).toBe("test-proxy");
      expect(proxy?.name).toBe("Test proxy");
      expect(proxy?.description).toBe("Test description");
    });

    it("update the configuration file", async () => {
      expect(await harness.database.countProxies()).toBe(1);
      const configEntry = await harness.database.getProxy("test-proxy");
      expect(configEntry).toBeDefined();
      expect(configEntry?.name).toBe("Test proxy");
      expect(configEntry?.description).toBe("Test description");
    });
  });

  describe("update", () => {
    let proxy: ProxyServerAttributes;
    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test proxy",
        description: "Old description",
      });
    });

    describe("description", () => {
      it("should update the description", async () => {
        const newDescription = "Updated description";
        const updatedResponse = await harness.client.store.update.mutate({
          proxyId: proxy.id,
          attributes: {
            description: newDescription,
          },
        });
        expect(updatedResponse.description).toBe(newDescription);
        const updatedProxy = await harness.client.store.get.query({
          proxyId: "test-proxy",
        });
        expect(updatedProxy?.description).toBe(newDescription);
      });
      it("should allow the description to be set to empty string", async () => {
        await harness.client.store.update.mutate({
          proxyId: proxy.id,
          attributes: {
            description: "",
          },
        });
        const updatedProxy = await harness.client.store.get.query({
          proxyId: "test-proxy",
        });
        expect(updatedProxy?.description).toBe("");
        const configEntry = await harness.database.getProxy("test-proxy");
        expect(configEntry?.description).toBe("");
      });
    });

    describe("name", () => {
      it("should update the name", async () => {
        const newName = "Updated name";
        const updatedResponse = await harness.client.store.update.mutate({
          proxyId: proxy.id,
          attributes: {
            name: newName,
          },
        });
        expect(updatedResponse.name).toBe(newName);
        const updatedProxy = await harness.client.store.get.query({
          proxyId: "test-proxy",
        });
        expect(updatedProxy?.name).toBe(newName);
      });
      it("should not allow the name to be set to empty string", async () => {
        await expect(
          harness.client.store.update.mutate({
            proxyId: proxy.id,
            attributes: { name: "" },
          }),
        ).rejects.toThrowError(TRPCClientError);

        const updatedProxy = await harness.client.store.get.query({
          proxyId: "test-proxy",
        });
        expect(updatedProxy?.name).toBe(proxy.name);
        const configEntry = await harness.database.getProxy("test-proxy");
        expect(configEntry?.name).toBe(proxy.name);
      });
    });

    it("should update the configuration file", async () => {
      const newDescription = "Updated description";
      const newName = "Updated name";

      await harness.client.store.update.mutate({
        proxyId: proxy.id,
        attributes: {
          description: newDescription,
          name: newName,
        },
      });
      const configEntry = await harness.database.getProxy("test-proxy");
      expect(configEntry?.description).toBe(newDescription);
      expect(configEntry?.name).toBe(newName);
    });
  });

  describe("delete", () => {
    beforeEach(async () => {
      await harness.purge();
      await harness.client.store.create.mutate({
        name: "Test proxy",
      });
      await harness.client.store.delete.mutate({
        proxyId: "test-proxy",
      });
    });

    it("should delete the proxy from the gateway", async () => {
      await expect(
        harness.client.store.get.query({ proxyId: "test-proxy" }),
      ).rejects.toThrowError(TRPCClientError);

      expect(await harness.client.store.getAll.query()).toHaveLength(0);
    });

    it("should delete the proxy from the configuration file", async () => {
      expect(await harness.database.countProxies()).toBe(0);
    });
  });
});

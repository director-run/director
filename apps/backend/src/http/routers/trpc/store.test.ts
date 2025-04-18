import { createTRPCClient } from "@trpc/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AppRouter } from ".";
import { setupIntegrationTest } from "../../../helpers/testHelpers";
import { ProxyServerStore } from "../../../services/proxy/ProxyServerStore";
describe("Store Router", () => {
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;
  let close: () => Promise<void>;
  let proxyStore: ProxyServerStore;

  beforeAll(async () => {
    const attributes = await setupIntegrationTest();
    trpcClient = attributes.trpcClient;
    close = attributes.close;
    proxyStore = attributes.proxyStore;
  });

  afterAll(async () => {
    await close();
  });

  it("should get all proxies", async () => {
    await proxyStore.purge();
    await proxyStore.create({
      name: "Test proxy",
    });
    await proxyStore.create({
      name: "Test proxy 2",
    });
    const proxies = await trpcClient.store.getAll.query();
    expect(proxies).toHaveLength(2);

    expect(proxies[0].id).toBe("test-proxy");
    expect(proxies[1].id).toBe("test-proxy-2");
  });

  it("should create a new proxy", async () => {
    await proxyStore.purge();
    await proxyStore.create({
      name: "Test proxy",
    });
    const proxy = await trpcClient.store.get.query({ proxyId: "test-proxy" });
    expect(proxy).toBeDefined();
    expect(proxy?.id).toBe("test-proxy");
    expect(proxy?.name).toBe("Test proxy");
  });

  it("should update a proxy", async () => {
    await proxyStore.purge();
    const prox = await proxyStore.create({
      name: "Test proxy",
      description: "Old description",
    });

    const newDescription = "Updated description";

    const updatedResponse = await trpcClient.store.update.mutate({
      proxyId: prox.id,
      attributes: {
        description: newDescription,
      },
    });
    expect(updatedResponse.description).toBe(newDescription);

    const proxy = await trpcClient.store.get.query({ proxyId: "test-proxy" });
    expect(proxy?.description).toBe(newDescription);
  });

  it("should delete a proxy", async () => {
    await proxyStore.purge();
    await proxyStore.create({
      name: "Test proxy",
    });
    await trpcClient.store.delete.mutate({ proxyId: "test-proxy" });

    expect(
      await trpcClient.store.get.query({ proxyId: "test-proxy" }),
    ).toBeUndefined();
    expect(await trpcClient.store.getAll.query()).toHaveLength(0);
  });
});

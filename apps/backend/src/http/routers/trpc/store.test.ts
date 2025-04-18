import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type IntegrationTestVariables,
  setupIntegrationTest,
} from "../../../helpers/testHelpers";
describe("Store Router", () => {
  let testVariables: IntegrationTestVariables;

  beforeAll(async () => {
    testVariables = await setupIntegrationTest();
  });

  afterAll(async () => {
    await testVariables.close();
  });

  it("should get all proxies", async () => {
    await testVariables.proxyStore.purge();
    await testVariables.proxyStore.create({
      name: "Test proxy",
    });
    await testVariables.proxyStore.create({
      name: "Test proxy 2",
    });
    const proxies = await testVariables.trpcClient.store.getAll.query();
    expect(proxies).toHaveLength(2);

    expect(proxies[0].id).toBe("test-proxy");
    expect(proxies[1].id).toBe("test-proxy-2");
  });

  it("should create a new proxy", async () => {
    await testVariables.proxyStore.purge();
    await testVariables.proxyStore.create({
      name: "Test proxy",
    });
    const proxy = await testVariables.trpcClient.store.get.query({
      proxyId: "test-proxy",
    });
    expect(proxy).toBeDefined();
    expect(proxy?.id).toBe("test-proxy");
    expect(proxy?.name).toBe("Test proxy");
  });

  it("should update a proxy", async () => {
    await testVariables.proxyStore.purge();
    const prox = await testVariables.proxyStore.create({
      name: "Test proxy",
      description: "Old description",
    });

    const newDescription = "Updated description";

    const updatedResponse = await testVariables.trpcClient.store.update.mutate({
      proxyId: prox.id,
      attributes: {
        description: newDescription,
      },
    });
    expect(updatedResponse.description).toBe(newDescription);

    const proxy = await testVariables.trpcClient.store.get.query({
      proxyId: "test-proxy",
    });
    expect(proxy?.description).toBe(newDescription);
  });

  it("should delete a proxy", async () => {
    await testVariables.proxyStore.purge();
    await testVariables.proxyStore.create({
      name: "Test proxy",
    });
    await testVariables.trpcClient.store.delete.mutate({
      proxyId: "test-proxy",
    });

    expect(
      await testVariables.trpcClient.store.get.query({ proxyId: "test-proxy" }),
    ).toBeUndefined();
    expect(await testVariables.trpcClient.store.getAll.query()).toHaveLength(0);
  });
});

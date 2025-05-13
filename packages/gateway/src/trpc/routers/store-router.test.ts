import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IntegrationTestHarness } from "../../test/integration";

describe("Store Router", () => {
  let testVariables: IntegrationTestHarness;

  beforeAll(async () => {
    testVariables = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await testVariables.stop();
  });

  it("should get all proxies", async () => {
    await testVariables.client.debug?.purge.mutate();
    await testVariables.client.store.create.mutate({
      name: "Test proxy",
    });
    await testVariables.client.store.create.mutate({
      name: "Test proxy 2",
    });
    const proxies = await testVariables.client.store.getAll.query();
    expect(proxies).toHaveLength(2);

    expect(proxies[0].id).toBe("test-proxy");
    expect(proxies[1].id).toBe("test-proxy-2");
  });

  it("should create a new proxy", async () => {
    await testVariables.client.debug?.purge.mutate();
    await testVariables.client.store.create.mutate({
      name: "Test proxy",
    });
    const proxy = await testVariables.client.store.get.query({
      proxyId: "test-proxy",
    });
    expect(proxy).toBeDefined();
    expect(proxy?.id).toBe("test-proxy");
    expect(proxy?.name).toBe("Test proxy");
  });

  it("should update a proxy", async () => {
    await testVariables.client.debug?.purge.mutate();
    const prox = await testVariables.client.store.create.mutate({
      name: "Test proxy",
      description: "Old description",
    });

    const newDescription = "Updated description";

    const updatedResponse = await testVariables.client.store.update.mutate({
      proxyId: prox.id,
      attributes: {
        description: newDescription,
      },
    });
    expect(updatedResponse.description).toBe(newDescription);

    const proxy = await testVariables.client.store.get.query({
      proxyId: "test-proxy",
    });
    expect(proxy?.description).toBe(newDescription);
  });

  it("should delete a proxy", async () => {
    await testVariables.client.debug?.purge.mutate();
    await testVariables.client.store.create.mutate({
      name: "Test proxy",
    });
    await testVariables.client.store.delete.mutate({
      proxyId: "test-proxy",
    });

    expect(
      await testVariables.client.store.get.query({ proxyId: "test-proxy" }),
    ).toBeUndefined();
    expect(await testVariables.client.store.getAll.query()).toHaveLength(0);
  });
});

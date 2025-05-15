import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IntegrationTestHarness } from "../../test/integration";

describe("Store Router", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  it("should get all proxies", async () => {
    await harness.purge();
    await harness.client.store.create.mutate({
      name: "Test proxy",
      servers: [],
    });
    await harness.client.store.create.mutate({
      name: "Test proxy 2",
      servers: [],
    });
    const proxies = await harness.client.store.getAll.query();
    expect(proxies).toHaveLength(2);

    expect(proxies[0].id).toBe("test-proxy");
    expect(proxies[1].id).toBe("test-proxy-2");
  });

  it("should create a new proxy", async () => {
    await harness.purge();
    await harness.client.store.create.mutate({
      name: "Test proxy",
      servers: [],
    });
    const proxy = await harness.client.store.get.query({
      proxyId: "test-proxy",
    });
    expect(proxy).toBeDefined();
    expect(proxy?.id).toBe("test-proxy");
    expect(proxy?.name).toBe("Test proxy");
  });

  it("should update a proxy", async () => {
    await harness.purge();
    const prox = await harness.client.store.create.mutate({
      name: "Test proxy",
      description: "Old description",
      servers: [],
    });

    const newDescription = "Updated description";

    const updatedResponse = await harness.client.store.update.mutate({
      proxyId: prox.id,
      attributes: {
        description: newDescription,
      },
    });
    expect(updatedResponse.description).toBe(newDescription);

    const proxy = await harness.client.store.get.query({
      proxyId: "test-proxy",
    });
    expect(proxy?.description).toBe(newDescription);
  });

  it("should delete a proxy", async () => {
    await harness.purge();
    await harness.client.store.create.mutate({
      name: "Test proxy",
      servers: [],
    });
    await harness.client.store.delete.mutate({
      proxyId: "test-proxy",
    });

    expect(
      await harness.client.store.get.query({ proxyId: "test-proxy" }),
    ).toBeUndefined();
    expect(await harness.client.store.getAll.query()).toHaveLength(0);
  });
});

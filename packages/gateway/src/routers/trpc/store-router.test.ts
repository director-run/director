import { TRPCClientError } from "@trpc/client";
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
    });
    await harness.client.store.create.mutate({
      name: "Test proxy 2",
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
      description: "Test description",
    });
    const proxy = await harness.client.store.get.query({
      proxyId: "test-proxy",
    });
    expect(proxy).toBeDefined();
    expect(proxy?.id).toBe("test-proxy");
    expect(proxy?.name).toBe("Test proxy");
    expect(proxy?.description).toBe("Test description");
  });

  it("should update a proxy", async () => {
    await harness.purge();
    const prox = await harness.client.store.create.mutate({
      name: "Test proxy",
      description: "Old description",
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
    });
    await harness.client.store.delete.mutate({
      proxyId: "test-proxy",
    });

    await expect(
      harness.client.store.get.query({ proxyId: "test-proxy" }),
    ).rejects.toThrowError(TRPCClientError);

    expect(await harness.client.store.getAll.query()).toHaveLength(0);
  });

  describe("addServer", () => {
    it("should fail if it can't connect a url", async () => {
      await harness.purge();
      const testProxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });

      await expect(
        harness.client.store.addServer.mutate({
          proxyId: testProxy.id,
          server: {
            name: "echo",
            transport: {
              type: "http",
              url: `http://localhost/not_existing_server`,
            },
          },
        }),
      ).rejects.toThrow(
        `[echo] failed to connect to http://localhost/not_existing_server`,
      );
    });

    it("should fail if it can't connect to stdio", async () => {
      await harness.purge();
      const testProxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });

      await expect(
        harness.client.store.addServer.mutate({
          proxyId: testProxy.id,
          server: {
            name: "echo",
            transport: {
              type: "stdio",
              command: "not_existing_command",
              args: [],
            },
          },
        }),
      ).rejects.toThrow(
        `[echo] command not found: 'not_existing_command'. Please make sure it is installed and available in your $PATH.`,
      );
    });

    it("should bubble up command errors properly", async () => {
      await harness.purge();
      const testProxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });

      await expect(
        harness.client.store.addServer.mutate({
          proxyId: testProxy.id,
          server: {
            name: "echo",
            transport: {
              type: "stdio",
              command: "ls",
              args: ["not_existing_dir"],
            },
          },
        }),
      ).rejects.toThrow(
        `[echo] failed to run 'ls not_existing_dir'. Please check the logs for more details.`,
      );
    });
  });
});

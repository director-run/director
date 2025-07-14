import { TRPCClientError } from "@trpc/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { makeFooBarServerStdioConfig } from "../../test/fixtures";
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

  describe("Status Management Endpoints", () => {
    beforeEach(async () => {
      await harness.purge();
      await harness.client.store.create.mutate({
        name: "Test proxy",
      });
      await harness.client.store.addServer.mutate({
        proxyId: "test-proxy",
        server: makeFooBarServerStdioConfig(),
      });
    });

    it("should get server status", async () => {
      const status = await harness.client.store.getServerStatus.query({
        proxyId: "test-proxy",
        serverName: "foo",
      });

      expect(status).toMatchObject({
        name: "foo",
        status: expect.any(String),
      });
    });

    it("should throw error for non-existent server", async () => {
      await expect(
        harness.client.store.getServerStatus.query({
          proxyId: "test-proxy",
          serverName: "non-existent",
        }),
      ).rejects.toThrow("Server non-existent not found");
    });

    it("should refresh server status", async () => {
      const status = await harness.client.store.refreshServerStatus.mutate({
        proxyId: "test-proxy",
        serverName: "foo",
      });

      expect(status).toMatchObject({
        status: expect.any(String),
      });
    });

    it("should enable server", async () => {
      // First disable the server
      await harness.client.store.disableServer.mutate({
        proxyId: "test-proxy",
        serverName: "foo",
      });

      const status = await harness.client.store.enableServer.mutate({
        proxyId: "test-proxy",
        serverName: "foo",
      });

      expect(status.status).not.toBe("disabled");
    });

    it("should disable server", async () => {
      const status = await harness.client.store.disableServer.mutate({
        proxyId: "test-proxy",
        serverName: "foo",
      });

      expect(status.status).toBe("disabled");
    });

    it("should restart server", async () => {
      const status = await harness.client.store.restartServer.mutate({
        proxyId: "test-proxy",
        serverName: "foo",
      });

      expect(status).toMatchObject({
        status: expect.any(String),
      });
    });

    it("should refresh all statuses", async () => {
      const statuses = await harness.client.store.refreshAllStatuses.mutate({
        proxyId: "test-proxy",
      });

      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject({
        name: "foo",
        status: expect.any(String),
      });
    });

    it("should throw error for non-existent proxy in status operations", async () => {
      await expect(
        harness.client.store.getServerStatus.query({
          proxyId: "non-existent",
          serverName: "foo",
        }),
      ).rejects.toThrow();
    });
  });

  describe("Enhanced getAll with Status", () => {
    beforeEach(async () => {
      await harness.purge();
      await harness.client.store.create.mutate({
        name: "Test proxy",
      });
      await harness.client.store.addServer.mutate({
        proxyId: "test-proxy",
        server: makeFooBarServerStdioConfig(),
      });
    });

    it("should include server status in getAll response", async () => {
      const proxies = await harness.client.store.getAll.query();

      expect(proxies).toHaveLength(1);
      expect(proxies[0].servers).toHaveLength(1);
      expect(proxies[0].servers[0]).toMatchObject({
        name: "foo",
        status: expect.any(String),
        transport: expect.any(Object),
      });
    });

    it("should include server status in get response", async () => {
      const proxy = await harness.client.store.get.query({
        proxyId: "test-proxy",
      });

      expect(proxy?.servers).toHaveLength(1);
      expect(proxy?.servers[0]).toMatchObject({
        name: "foo",
        status: expect.any(String),
        transport: expect.any(Object),
      });
    });
  });
});

import {} from "@director.run/mcp/test/fixtures";
import {} from "@director.run/mcp/transport";
import type {
  HTTPTransport,
  ProxyServerAttributes,
  ProxyTargetAttributes,
} from "@director.run/utilities/schema";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "./client";
import { IntegrationTestHarness } from "./test/integration";

describe("Proxy Target CRUD operations", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("read", () => {
    let proxy: ProxyServerAttributes;
    beforeAll(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [harness.getConfigForTarget("echo")],
      });
    });
    it("should be able to retrieve a target", async () => {
      const retrievedTarget = await harness.client.store.getServer.query({
        proxyId: proxy.id,
        serverName: "echo",
      });

      expect(retrievedTarget).toBeDefined();
      expect(retrievedTarget.name).toBe("echo");
      expect(retrievedTarget.status).toBe("connected");
      expect(retrievedTarget.command).toBe(
        (harness.getConfigForTarget("echo").transport as HTTPTransport).url,
      );
      expect(retrievedTarget.type).toBe("http");
    });
  });

  describe("create", () => {
    let proxy: ProxyServerAttributes;
    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });
    });

    describe("unauthorized target", () => {
      it("should succeed and return target", async () => {
        const target = await harness.client.store.addServer.mutate({
          proxyId: proxy.id,
          server: {
            name: "notion",
            transport: {
              type: "http",
              url: `https://mcp.notion.com/mcp`,
            },
          },
        });

        expect(target.status).toBe("unauthorized");
        expect(target.command).toBe("https://mcp.notion.com/mcp");
        expect(target.type).toBe("http");
      });

      it("should update the configuration file", async () => {
        await harness.client.store.addServer.mutate({
          proxyId: proxy.id,
          server: {
            name: "notion",
            transport: {
              type: "http",
              url: `https://mcp.notion.com/mcp`,
            },
          },
        });

        const configEntry = (await harness.database.getServer(
          proxy.id,
          "notion",
        )) as ProxyTargetAttributes;

        expect((configEntry.transport as HTTPTransport).url).toBe(
          "https://mcp.notion.com/mcp",
        );
        expect(configEntry.transport.type).toBe("http");
      });
    });

    describe("unreachable url", () => {
      it("should fail", async () => {
        await expect(
          harness.client.store.addServer.mutate({
            proxyId: proxy.id,
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

        expect(await harness.database.getProxy(proxy.id)).toEqual(
          expect.objectContaining({
            name: "Test Proxy",
            servers: [],
          }),
        );

        expect(
          await harness.client.store.get.query({
            proxyId: proxy.id,
          }),
        ).toEqual(
          expect.objectContaining({
            name: "Test Proxy",
            servers: [],
          }),
        );
      });
    });

    describe("invalid stdio command", () => {
      it("should fail if the command is not found", async () => {
        await expect(
          harness.client.store.addServer.mutate({
            proxyId: proxy.id,
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

        expect(await harness.database.getProxy(proxy.id)).toEqual(
          expect.objectContaining({
            name: "Test Proxy",
            servers: [],
          }),
        );

        expect(
          await harness.client.store.get.query({
            proxyId: proxy.id,
          }),
        ).toEqual(
          expect.objectContaining({
            name: "Test Proxy",
            servers: [],
          }),
        );
      });

      it("should fail if the command fails", async () => {
        await expect(
          harness.client.store.addServer.mutate({
            proxyId: proxy.id,
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

        expect(await harness.database.getProxy(proxy.id)).toEqual(
          expect.objectContaining({
            name: "Test Proxy",
            servers: [],
          }),
        );

        expect(
          await harness.client.store.get.query({
            proxyId: proxy.id,
          }),
        ).toEqual(
          expect.objectContaining({
            name: "Test Proxy",
            servers: [],
          }),
        );
      });
    });

    describe("valid target", () => {
      let addServerResponse: GatewayRouterOutputs["store"]["addServer"];
      beforeEach(async () => {
        addServerResponse = await harness.client.store.addServer.mutate({
          proxyId: proxy.id,
          server: {
            ...harness.getConfigForTarget("echo"),
            toolPrefix: "echo",
            disabledTools: ["echo"],
          },
        });
      });

      it("should succeed", () => {
        expect(addServerResponse.status).toBe("connected");
        expect(addServerResponse.command).toBe(
          (harness.getConfigForTarget("echo").transport as HTTPTransport).url,
        );
      });

      it("should update the configuration file", async () => {
        expect(await harness.database.getServer(proxy.id, "echo")).toEqual(
          expect.objectContaining({
            ...harness.getConfigForTarget("echo"),
            toolPrefix: "echo",
            disabledTools: ["echo"],
          }),
        );
      });

      it("should be reflected in the proxy", async () => {
        const proxyResponse = await harness.client.store.get.query({
          proxyId: proxy.id,
        });
        expect(proxyResponse.servers[0]).toEqual(
          expect.objectContaining({
            ...harness.getConfigForTarget("echo"),
            status: "connected",
            toolPrefix: "echo",
            disabledTools: ["echo"],
          }),
        );
      });

      it("should be queryable", async () => {
        const target = await harness.client.store.getServer.query({
          proxyId: proxy.id,
          serverName: "echo",
        });
        expect(target).toEqual(addServerResponse);
      });

      it("should fail if server already exists", async () => {
        await expect(
          harness.client.store.addServer.mutate({
            proxyId: proxy.id,
            server: {
              ...harness.getConfigForTarget("echo"),
              toolPrefix: "echo",
              disabledTools: ["echo"],
            },
          }),
        ).rejects.toThrow();
      });
    });
  });

  describe("delete", () => {
    let proxy: ProxyServerAttributes;

    beforeAll(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [harness.getConfigForTarget("echo")],
      });
    });

    it("should delete a server", async () => {
      const deletedTarget = await harness.client.store.removeServer.mutate({
        proxyId: proxy.id,
        serverName: "echo",
      });

      expect(deletedTarget.status).toBe("disconnected");
      expect(deletedTarget.name).toBe("echo");

      const proxyResponse = await harness.client.store.get.query({
        proxyId: proxy.id,
      });

      expect(proxyResponse.servers).toEqual([]);
    });

    it("should fail if server does not exist", async () => {
      await expect(
        harness.client.store.removeServer.mutate({
          proxyId: proxy.id,
          serverName: "not_existing_server",
        }),
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    let proxy: ProxyServerAttributes;
    let updatedResponse: GatewayRouterOutputs["store"]["updateServer"];
    const toolPrefix = "prefix__";
    const disabledTools = ["ping", "add"];

    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [
          harness.getConfigForTarget("echo"),
          harness.getConfigForTarget("kitchenSink"),
        ],
      });
      updatedResponse = await harness.client.store.updateServer.mutate({
        proxyId: proxy.id,
        serverName: "echo",
        attributes: {
          toolPrefix: toolPrefix,
          disabledTools: disabledTools,
        },
      });
    });

    it("should return the updated target", () => {
      expect(updatedResponse.toolPrefix).toBe(toolPrefix);
      expect(updatedResponse.disabledTools).toMatchObject(disabledTools);
      expect(updatedResponse.name).toBe("echo");
    });

    it("should update the target", async () => {
      const target = await harness.client.store.getServer.query({
        proxyId: proxy.id,
        serverName: "echo",
      });
      expect(target.toolPrefix).toBe(toolPrefix);
      expect(target.disabledTools).toMatchObject(disabledTools);
    });
    it("should update the configuration file", async () => {
      const configEntry = (await harness.database.getServer(
        proxy.id,
        "echo",
      )) as ProxyTargetAttributes;
      expect(configEntry.toolPrefix).toBe(toolPrefix);
      expect(configEntry.disabledTools).toMatchObject(disabledTools);
    });

    it("should be able to unset attributes", async () => {
      updatedResponse = await harness.client.store.updateServer.mutate({
        proxyId: proxy.id,
        serverName: "echo",
        attributes: { toolPrefix: "", disabledTools: [] },
      });
      expect(updatedResponse.toolPrefix).toBe("");
      expect(updatedResponse.disabledTools).toMatchObject([]);
      const target = await harness.client.store.getServer.query({
        proxyId: proxy.id,
        serverName: "echo",
      });
      expect(target.toolPrefix).toBe("");
      expect(target.disabledTools).toMatchObject([]);
      const configEntry = (await harness.database.getServer(
        proxy.id,
        "echo",
      )) as ProxyTargetAttributes;
      expect(configEntry.toolPrefix).toBe("");
      expect(configEntry.disabledTools).toMatchObject([]);
    });
  });
});

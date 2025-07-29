import type { Server } from "node:http";
import {
  makeEchoServer,
  makeHTTPTargetConfig,
} from "@director.run/mcp/test/fixtures";
import { serveOverSSE } from "@director.run/mcp/transport";
import type {
  HTTPTransport,
  ProxyServerAttributes,
  ProxyTargetAttributes,
} from "@director.run/utilities/schema";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "./client";
import { IntegrationTestHarness } from "./test/integration";

const PROXY_TARGET_PORT = 4521;
const echoServerSSEConfig = makeHTTPTargetConfig({
  name: "echo",
  url: `http://localhost:${PROXY_TARGET_PORT}/sse`,
});

describe("Proxy Target CRUD operations", () => {
  let harness: IntegrationTestHarness;
  let echoServerSSEInstance: Server;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
    echoServerSSEInstance = await serveOverSSE(
      makeEchoServer(),
      PROXY_TARGET_PORT,
    );
  });

  afterAll(async () => {
    await harness.stop();
    await echoServerSSEInstance?.close();
  });

  describe("read", () => {
    let proxy: ProxyServerAttributes;
    beforeAll(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [echoServerSSEConfig],
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
        (echoServerSSEConfig.transport as HTTPTransport).url,
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
          server: echoServerSSEConfig,
        });
      });

      it("should succeed", () => {
        expect(addServerResponse.status).toBe("connected");
        expect(addServerResponse.command).toBe(
          `http://localhost:${PROXY_TARGET_PORT}/sse`,
        );
      });

      it("should update the configuration file", async () => {
        expect(await harness.database.getServer(proxy.id, "echo")).toEqual(
          echoServerSSEConfig,
        );
      });

      it("should be reflected in the proxy", async () => {
        const proxyResponse = await harness.client.store.get.query({
          proxyId: proxy.id,
        });
        expect(proxyResponse.servers[0]).toEqual(
          expect.objectContaining({
            ...echoServerSSEConfig,
            status: "connected",
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
    });
  });

  describe("delete", () => {
    let proxy: ProxyServerAttributes;

    beforeAll(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [echoServerSSEConfig],
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
  });

  describe("update", () => {
    it("should support adding, removing and updating servers", async () => {
      // create a proxy with a server
      // add a server
      // remove a server
      // update a server
      // get a server
      // get all servers
      // get all proxies
      // get all servers from a proxy
      // tool prefix
      // disabled tools
    });
  });
  // it("should update addToolPrefix", async () => {
  //   await harness.purge();
  //   const prox = await harness.client.store.create.mutate({
  //     name: "Test proxy",
  //   });
  //   expect(prox.addToolPrefix).toBeFalsy();

  //   const updatedResponse = await harness.client.store.update.mutate({
  //     proxyId: prox.id,
  //     attributes: {
  //       addToolPrefix: true,
  //     },
  //   });
  //   expect(updatedResponse.addToolPrefix).toBe(true);

  //   const proxy = await harness.client.store.get.query({
  //     proxyId: "test-proxy",
  //   });
  //   expect(proxy?.addToolPrefix).toBe(true);

  //   const newUpdatedResponse = await harness.client.store.update.mutate({
  //     proxyId: prox.id,
  //     attributes: {
  //       addToolPrefix: false,
  //     },
  //   });
  //   expect(newUpdatedResponse.addToolPrefix).toBe(false);
  // });
});

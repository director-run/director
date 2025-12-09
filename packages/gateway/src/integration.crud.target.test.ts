import {} from "@director.run/mcp/test/fixtures";
import {} from "@director.run/mcp/transport";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "./client";
import { type PlaybookHTTPTarget } from "./playbooks/playbook";
import { IntegrationTestHarness } from "./test/integration";

describe("Playbook Target CRUD operations", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
    await harness.register({
      email: "test@example.com",
      password: "password123",
    });
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("read", () => {
    let playbook: GatewayRouterOutputs["store"]["create"];
    beforeAll(async () => {
      await harness.initializeDatabase(true);
      playbook = await harness.client.store.create.mutate({
        name: "Test Playbook",
      });
      const echoConfig = harness.getConfigForTarget("echo");
      await harness.client.store.addHTTPServer.mutate({
        playbookId: playbook.id,
        name: echoConfig.name,
        url: echoConfig.transport.url,
      });
    });
    it("should be able to retrieve a target", async () => {
      const retrievedTarget = await harness.client.store.getServer.query({
        playbookId: playbook.id,
        serverName: "echo",
      });

      expect(retrievedTarget).toBeDefined();
      expect(retrievedTarget.name).toBe("echo");
      expect(retrievedTarget.connectionInfo?.status).toBe("connected");
      expect(retrievedTarget.type).toBe("http");
      expect((retrievedTarget as PlaybookHTTPTarget).url).toEqual(
        harness.getConfigForTarget("echo").transport.url,
      );
    });

    it("should return tools if includeTools is true", async () => {
      const retrievedTarget = await harness.client.store.getServer.query({
        playbookId: playbook.id,
        serverName: "echo",
        queryParams: { includeTools: true },
      });
      expect(retrievedTarget.toolsList).toBeDefined();
      expect(retrievedTarget.toolsList?.length).toBeGreaterThan(0);
      expect(retrievedTarget.toolsList?.[0].name).toBe("echo");
    });
  });

  describe("create", () => {
    let playbook: GatewayRouterOutputs["store"]["create"];
    beforeEach(async () => {
      await harness.initializeDatabase(true);
      playbook = await harness.client.store.create.mutate({
        name: "Test Playbook",
      });
    });

    describe("unauthorized target", () => {
      it("should succeed and return target", async () => {
        const target = await harness.client.store.addHTTPServer.mutate({
          playbookId: playbook.id,
          name: "notion",
          url: `https://mcp.notion.com/mcp`,
        });

        expect(target.connectionInfo?.status).toBe("unauthorized");

        expect((target as PlaybookHTTPTarget).url).toEqual(
          `https://mcp.notion.com/mcp`,
        );
        expect((target as PlaybookHTTPTarget).type).toEqual(`http`);
      });

      it("should update the configuration file", async () => {
        await harness.client.store.addHTTPServer.mutate({
          playbookId: playbook.id,
          name: "notion",
          url: `https://mcp.notion.com/mcp`,
        });

        const configEntry = (
          await harness.database.getPlaybookWithDetails(
            playbook.id,
            harness.getUserId(),
          )
        ).servers.find((server) => server.name === "notion");

        expect(configEntry).toEqual(
          expect.objectContaining({
            type: "http",
            url: "https://mcp.notion.com/mcp",
          }),
        );
      });
    });

    describe("unreachable url", () => {
      it("should fail", async () => {
        await expect(
          harness.client.store.addHTTPServer.mutate({
            playbookId: playbook.id,
            name: "echo",
            url: `http://localhost/not_existing_server`,
          }),
        ).rejects.toThrow(
          `[echo] failed to connect to http://localhost/not_existing_server`,
        );

        expect(
          await harness.database.getPlaybookWithDetails(
            playbook.id,
            harness.getUserId(),
          ),
        ).toEqual(
          expect.objectContaining({
            name: "Test Playbook",
          }),
        );

        expect(
          await harness.client.store.get.query({
            playbookId: playbook.id,
          }),
        ).toEqual(
          expect.objectContaining({
            name: "Test Playbook",
          }),
        );
      });
    });

    describe("invalid stdio command", () => {
      it("should fail if the command is not found", async () => {
        await expect(
          harness.client.store.addStdioServer.mutate({
            playbookId: playbook.id,
            name: "echo",
            command: "not_existing_command",
            args: [],
          }),
        ).rejects.toThrow(
          `[echo] command not found: 'not_existing_command'. Please make sure it is installed and available in your $PATH.`,
        );

        expect(
          await harness.database.getPlaybookWithDetails(
            playbook.id,
            harness.getUserId(),
          ),
        ).toEqual(
          expect.objectContaining({
            name: "Test Playbook",
          }),
        );

        expect(
          await harness.client.store.get.query({
            playbookId: playbook.id,
          }),
        ).toEqual(
          expect.objectContaining({
            name: "Test Playbook",
          }),
        );
      });

      it("should fail if the command fails", async () => {
        await expect(
          harness.client.store.addStdioServer.mutate({
            playbookId: playbook.id,
            name: "echo",
            command: "ls",
            args: ["not_existing_dir"],
          }),
        ).rejects.toThrow(
          `[echo] failed to run 'ls not_existing_dir'. Please check the logs for more details.`,
        );

        expect(
          await harness.database.getPlaybookWithDetails(
            playbook.id,
            harness.getUserId(),
          ),
        ).toEqual(
          expect.objectContaining({
            name: "Test Playbook",
          }),
        );

        expect(
          await harness.client.store.get.query({
            playbookId: playbook.id,
          }),
        ).toEqual(
          expect.objectContaining({
            name: "Test Playbook",
          }),
        );
      });
    });

    describe("addRegistryServer", () => {
      it("should add a server from the registry and list its tools", async () => {
        await harness.initializeDatabase(true);
        const testPlaybook = await harness.client.store.create.mutate({
          name: "Registry Test Playbook",
        });

        // Add the hackernews server from the registry
        const addedServer = await harness.client.store.addRegistryServer.mutate(
          {
            playbookId: testPlaybook.id,
            registryEntryName: "hackernews",
          },
        );

        expect(addedServer.name).toBe("hackernews");
        expect(addedServer.type).toBe("stdio");
        expect(addedServer.connectionInfo?.status).toBe("connected");
        expect(addedServer.source).toEqual({
          name: "registry",
          entryId: expect.any(String),
        });

        // List tools to verify the server works
        const serverWithTools = await harness.client.store.getServer.query({
          playbookId: testPlaybook.id,
          serverName: "hackernews",
          queryParams: { includeTools: true },
        });

        expect(serverWithTools.toolsList).toBeDefined();
        expect(serverWithTools.toolsList?.length).toBeGreaterThan(0);
      });
    });

    describe("addHTTPServer", () => {
      it("should add an HTTP server to a playbook", async () => {
        await harness.initializeDatabase(true);
        const testPlaybook = await harness.client.store.create.mutate({
          name: "HTTP Server Test Playbook",
        });

        const echoConfig = harness.getConfigForTarget("echo");
        const addedServer = await harness.client.store.addHTTPServer.mutate({
          playbookId: testPlaybook.id,
          name: "echo",
          url: echoConfig.transport.url,
        });

        expect(addedServer.name).toBe("echo");
        expect(addedServer.type).toBe("http");
        expect(addedServer.connectionInfo?.status).toBe("connected");
        expect((addedServer as PlaybookHTTPTarget).url).toBe(
          echoConfig.transport.url,
        );

        // List tools to verify the server works
        const serverWithTools = await harness.client.store.getServer.query({
          playbookId: testPlaybook.id,
          serverName: "echo",
          queryParams: { includeTools: true },
        });

        expect(serverWithTools.toolsList).toBeDefined();
        expect(serverWithTools.toolsList?.length).toBeGreaterThan(0);
        expect(serverWithTools.toolsList?.[0].name).toBe("echo");
      });

      it("should add an HTTP server with headers", async () => {
        await harness.initializeDatabase(true);
        const testPlaybook = await harness.client.store.create.mutate({
          name: "HTTP Server Headers Test",
        });

        const addedServer = await harness.client.store.addHTTPServer.mutate({
          playbookId: testPlaybook.id,
          name: "notion",
          url: "https://mcp.notion.com/mcp",
          headers: { Authorization: "Bearer test-token" },
        });

        expect(addedServer.name).toBe("notion");
        expect(addedServer.type).toBe("http");
        // Notion requires auth so it will be unauthorized
        expect(addedServer.connectionInfo?.status).toBe("unauthorized");
      });
    });

    describe("addStdioServer", () => {
      it("should add a stdio server to a playbook", async () => {
        await harness.initializeDatabase(true);
        const testPlaybook = await harness.client.store.create.mutate({
          name: "Stdio Server Test Playbook",
        });

        const addedServer = await harness.client.store.addStdioServer.mutate({
          playbookId: testPlaybook.id,
          name: "foobar-stdio",
          command: "bun",
          args: [
            "-e",
            `
            import { makeFooBarServer } from "@director.run/mcp/test/fixtures";
            import { serveOverStdio } from "@director.run/mcp/transport";
            serveOverStdio(makeFooBarServer());
          `,
          ],
        });

        expect(addedServer.name).toBe("foobar-stdio");
        expect(addedServer.type).toBe("stdio");
        expect(addedServer.connectionInfo?.status).toBe("connected");

        // List tools to verify the server works
        const serverWithTools = await harness.client.store.getServer.query({
          playbookId: testPlaybook.id,
          serverName: "foobar-stdio",
          queryParams: { includeTools: true },
        });

        expect(serverWithTools.toolsList).toBeDefined();
        expect(serverWithTools.toolsList?.length).toBeGreaterThan(0);
      });

      it("should fail for invalid command", async () => {
        await harness.initializeDatabase(true);
        const testPlaybook = await harness.client.store.create.mutate({
          name: "Invalid Stdio Test",
        });

        await expect(
          harness.client.store.addStdioServer.mutate({
            playbookId: testPlaybook.id,
            name: "invalid",
            command: "not_existing_command",
            args: [],
          }),
        ).rejects.toThrow(
          `[invalid] command not found: 'not_existing_command'. Please make sure it is installed and available in your $PATH.`,
        );
      });
    });

    describe("valid target", () => {
      let addServerResponse: GatewayRouterOutputs["store"]["addHTTPServer"];
      beforeEach(async () => {
        const echoConfig = harness.getConfigForTarget("echo");
        addServerResponse = await harness.client.store.addHTTPServer.mutate({
          playbookId: playbook.id,
          name: echoConfig.name,
          url: echoConfig.transport.url,
        });
      });

      it("should succeed", () => {
        expect(addServerResponse.connectionInfo?.status).toBe("connected");
        expect((addServerResponse as PlaybookHTTPTarget).url).toEqual(
          harness.getConfigForTarget("echo").transport.url,
        );
        expect((addServerResponse as PlaybookHTTPTarget).type).toEqual("http");
      });

      it("should update the configuration file", async () => {
        const echoConfig = harness.getConfigForTarget("echo");
        expect(
          (
            await harness.database.getPlaybookWithDetails(
              playbook.id,
              harness.getUserId(),
            )
          ).servers.find((server) => server.name === "echo"),
        ).toEqual(
          expect.objectContaining({
            type: "http",
            url: (echoConfig as { transport: { url: string } }).transport.url,
            name: echoConfig.name,
          }),
        );
      });

      it("should be reflected in the playbook", async () => {
        const playbookResponse = await harness.client.store.get.query({
          playbookId: playbook.id,
        });
        const echoConfig = harness.getConfigForTarget("echo");
        expect(playbookResponse.servers[0]).toEqual(
          expect.objectContaining({
            url: echoConfig.transport.url,
            type: echoConfig.transport.type,
            disabled: false,
            name: echoConfig.name,
            source: undefined,
            toolsList: undefined,
            connectionInfo: {
              status: "connected",
              lastConnectedAt: expect.any(Date),
              lastErrorMessage: undefined,
              isAuthenticated: false,
            },
          }),
        );
      });

      it("should be queryable", async () => {
        const target = await harness.client.store.getServer.query({
          playbookId: playbook.id,
          serverName: "echo",
        });
        expect(target).toEqual(addServerResponse);
      });

      it("should fail if server already exists", async () => {
        const echoConfig = harness.getConfigForTarget("echo");
        await expect(
          harness.client.store.addHTTPServer.mutate({
            playbookId: playbook.id,
            name: echoConfig.name,
            url: echoConfig.transport.url,
          }),
        ).rejects.toThrow();
      });
    });
  });

  describe("delete", () => {
    let playbook: GatewayRouterOutputs["store"]["create"];

    beforeAll(async () => {
      await harness.initializeDatabase(true);
      playbook = await harness.client.store.create.mutate({
        name: "Test Playbook",
      });
      const echoConfig = harness.getConfigForTarget("echo");
      await harness.client.store.addHTTPServer.mutate({
        playbookId: playbook.id,
        name: echoConfig.name,
        url: echoConfig.transport.url,
      });
    });

    it("should delete a server", async () => {
      const deletedTarget = await harness.client.store.removeServer.mutate({
        playbookId: playbook.id,
        serverName: "echo",
      });

      expect(deletedTarget.connectionInfo?.status).toBe("disconnected");
      expect(deletedTarget.name).toBe("echo");

      const playbookResponse = await harness.client.store.get.query({
        playbookId: playbook.id,
      });

      expect(playbookResponse.servers).toEqual([]);
    });

    it("should fail if server does not exist", async () => {
      await expect(
        harness.client.store.removeServer.mutate({
          playbookId: playbook.id,
          serverName: "not_existing_server",
        }),
      ).rejects.toThrow();
    });
  });

  describe("update", () => {
    describe("target attributes", () => {
      let playbook: GatewayRouterOutputs["store"]["create"];
      let updatedResponse: GatewayRouterOutputs["store"]["updateServer"];
      const toolsConfig = { prefix: "prefix__", exclude: ["ping", "add"] };
      beforeEach(async () => {
        await harness.initializeDatabase(true);
        playbook = await harness.client.store.create.mutate({
          name: "Test Playbook",
        });
        const echoConfig = harness.getConfigForTarget("echo");
        await harness.client.store.addHTTPServer.mutate({
          playbookId: playbook.id,
          name: echoConfig.name,
          url: echoConfig.transport.url,
        });
        const kitchenSinkConfig = harness.getConfigForTarget("kitchenSink");
        await harness.client.store.addHTTPServer.mutate({
          playbookId: playbook.id,
          name: kitchenSinkConfig.name,
          url: kitchenSinkConfig.transport.url,
        });
        updatedResponse = await harness.client.store.updateServer.mutate({
          playbookId: playbook.id,
          serverName: "echo",
          attributes: {
            tools: toolsConfig,
          },
        });
      });
      it("should return the updated target", () => {
        expect(updatedResponse.tools).toMatchObject(toolsConfig);
        expect(updatedResponse.name).toBe("echo");
      });
      it("should return tools if includeTools is true", async () => {
        const retrievedTarget = await harness.client.store.updateServer.mutate({
          playbookId: playbook.id,
          serverName: "echo",
          attributes: {
            tools: { prefix: "", exclude: [] },
          },
          queryParams: { includeTools: true },
        });
        expect(retrievedTarget.toolsList).toBeDefined();
        expect(retrievedTarget.toolsList?.length).toBeGreaterThan(0);
        expect(retrievedTarget.toolsList?.[0].name).toBe("echo");
      });
      it("should update the target", async () => {
        const target = await harness.client.store.getServer.query({
          playbookId: playbook.id,
          serverName: "echo",
        });
        expect(target.tools).toMatchObject(toolsConfig);
      });
      it("should update the configuration file", async () => {
        const configEntry = (
          await harness.database.getPlaybookWithDetails(
            playbook.id,
            harness.getUserId(),
          )
        ).servers.find((server) => server.name === "echo");
        expect(configEntry?.tools).toMatchObject(toolsConfig);
      });
      it("should be able to unset attributes", async () => {
        updatedResponse = await harness.client.store.updateServer.mutate({
          playbookId: playbook.id,
          serverName: "echo",
          attributes: { tools: { prefix: "", exclude: [] } },
        });
        expect(updatedResponse.tools).toMatchObject({
          prefix: "",
          exclude: [],
        });
        const target = await harness.client.store.getServer.query({
          playbookId: playbook.id,
          serverName: "echo",
        });
        expect(target.tools).toMatchObject({ prefix: "", exclude: [] });
        const configEntry = (
          await harness.database.getPlaybookWithDetails(
            playbook.id,
            harness.getUserId(),
          )
        ).servers.find((server) => server.name === "echo");
        expect(configEntry?.tools).toMatchObject({ prefix: "", exclude: [] });
      });
    });

    describe("disabling targets", () => {
      let playbook: GatewayRouterOutputs["store"]["create"];
      beforeEach(async () => {
        await harness.initializeDatabase(true);
        playbook = await harness.client.store.create.mutate({
          name: "Test Playbook",
        });
        // Add echo server and then disable it
        const echoConfig = harness.getConfigForTarget("echo");
        await harness.client.store.addHTTPServer.mutate({
          playbookId: playbook.id,
          name: echoConfig.name,
          url: echoConfig.transport.url,
        });
        await harness.client.store.updateServer.mutate({
          playbookId: playbook.id,
          serverName: echoConfig.name,
          attributes: { disabled: true },
        });
        // Add kitchen-sink server (enabled)
        const kitchenSinkConfig = harness.getConfigForTarget("kitchenSink");
        await harness.client.store.addHTTPServer.mutate({
          playbookId: playbook.id,
          name: kitchenSinkConfig.name,
          url: kitchenSinkConfig.transport.url,
        });
      });
      it("should return the disabled target correctly", async () => {
        const disabledTarget = await harness.client.store.getServer.query({
          playbookId: playbook.id,
          serverName: "echo",
        });
        expect(disabledTarget.disabled).toBe(true);
        expect(disabledTarget.connectionInfo?.status).toBe("disconnected");
        const enabledTarget = await harness.client.store.getServer.query({
          playbookId: playbook.id,
          serverName: "kitchen-sink",
        });
        expect(enabledTarget.disabled).toBeFalsy();
        expect(enabledTarget.connectionInfo?.status).toBe("connected");
      });
      it("should be stored in the configuration file", async () => {
        const configEntry = (
          await harness.database.getPlaybookWithDetails(
            playbook.id,
            harness.getUserId(),
          )
        ).servers.find((server) => server.name === "echo");
        expect(configEntry?.disabled).toBe(true);
      });
      describe("enabling disabled targets", () => {
        let updatedResponse: GatewayRouterOutputs["store"]["updateServer"];
        beforeEach(async () => {
          updatedResponse = await harness.client.store.updateServer.mutate({
            playbookId: playbook.id,
            serverName: "echo",
            attributes: { disabled: false },
          });
        });
        it("should return the updated target", () => {
          expect(updatedResponse.disabled).toBe(false);
          expect(updatedResponse.connectionInfo?.status).toBe("connected");
        });
        it("should be reflected in the playbook", async () => {
          const target = await harness.client.store.getServer.query({
            playbookId: playbook.id,
            serverName: "echo",
          });
          expect(target.disabled).toBe(false);
          expect(target.connectionInfo?.status).toBe("connected");
        });
        it("should be reflected in the configuration file", async () => {
          const configEntry = (
            await harness.database.getPlaybookWithDetails(
              playbook.id,
              harness.getUserId(),
            )
          ).servers.find((server) => server.name === "echo");
          expect(configEntry?.disabled).toBe(false);
        });
      });
    });
  });
});

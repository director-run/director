import { createGatewayClient, register } from "@director.run/gateway/client";
import { Database } from "@director.run/gateway/db/database";
import { env } from "@director.run/gateway/env";
import { Gateway } from "@director.run/gateway/gateway";
import {
  initializeTestDatabase,
  resetPlaybookStore,
} from "@director.run/gateway/test/db";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { runCLICommand } from "./test/helpers";
import { clearAuthToken, saveAuthToken } from "./utils/auth";

describe("CLI integration tests", () => {
  let gateway: Gateway;
  let database: Database;
  let gatewayClient: ReturnType<typeof createGatewayClient>;
  const baseURL = `http://localhost:${env.PORT}`;

  beforeAll(async () => {
    database = Database.create(env.DATABASE_URL);
    await initializeTestDatabase({ database, keepUsers: false });

    gateway = await Gateway.start({
      database,
      port: env.PORT,
    });

    // Register a test user
    const { user, sessionCookie } = await register(baseURL, {
      email: "test@example.com",
      password: "password123",
    });

    // Activate user for testing - new users are PENDING by default
    await database.activateUser(user.id);

    saveAuthToken(sessionCookie);
    gatewayClient = createGatewayClient(baseURL, {
      getAuthToken: () => sessionCookie,
    });
  });

  afterAll(async () => {
    clearAuthToken();
    await gateway.stop();
    await database.close();
  });

  beforeEach(async () => {
    await resetPlaybookStore(gateway.playbookStore);
    await initializeTestDatabase({ database, keepUsers: true });
  });

  test("should be able to create a playbook server", async () => {
    await runCLICommand("create", "test");
    expect(await gatewayClient.store.getAll.query()).toContainEqual(
      expect.objectContaining({
        id: "test",
        name: "test",
      }),
    );
  });

  describe("adding a server to a playbook", () => {
    beforeEach(async () => {
      await runCLICommand("create", "test");
    });

    test(
      "should be able to add a server from the registry",
      { timeout: 10000 },
      async () => {
        await runCLICommand("add", "test", "--entry", "hackernews");

        const playbook = await gatewayClient.store.get.query({
          playbookId: "test",
        });
        expect(playbook.servers).toContainEqual(
          expect.objectContaining({
            name: "hackernews",
            type: "stdio",
            command: "uvx",
            args: [
              "--from",
              "git+https://github.com/erithwik/mcp-hn",
              "mcp-hn",
            ],
          }),
        );
      },
    );

    test("should be able to add a server using a command", async () => {
      await runCLICommand(
        "add",
        "test",
        "--name",
        "custom-fetch",
        "--command",
        "uvx mcp-server-fetch",
      );

      const playbook = await gatewayClient.store.get.query({
        playbookId: "test",
      });
      expect(playbook.servers).toContainEqual(
        expect.objectContaining({
          name: "custom-fetch",
          type: "stdio",
          command: "uvx",
          args: ["mcp-server-fetch"],
        }),
      );
    });

    test("should be able to add an oauth authenticated server", async () => {
      await runCLICommand(
        "add",
        "test",
        "--name",
        "notion",
        "--url",
        "https://mcp.notion.com/mcp",
      );

      const playbook = await gatewayClient.store.get.query({
        playbookId: "test",
      });
      expect(playbook.servers).toContainEqual(
        expect.objectContaining({
          name: "notion",
          type: "http",
          url: "https://mcp.notion.com/mcp",
        }),
      );
    });

    test("should fail when adding server without required name for url", async () => {
      const result = await runCLICommand(
        "add",
        "test",
        "--url",
        "https://example.com/mcp",
      );
      // The command should complete but with an error message
      expect(result.stdout).toContain("No server name provided");
    });

    test("should fail when adding server without required name for command", async () => {
      const result = await runCLICommand(
        "add",
        "test",
        "--command",
        "uvx mcp-server-fetch",
      );
      // The command should complete but with an error message
      expect(result.stdout).toContain("No server name provided");
    });
  });

  describe("updating a playbook", () => {
    beforeEach(async () => {
      await runCLICommand("create", "test");
    });

    test("should be able to update multiple attributes", async () => {
      await runCLICommand("add", "test", "--entry", "hackernews");

      await runCLICommand(
        "update",
        "test",
        "hackernews",
        "-a",
        'tools={"prefix":"h_","exclude":["get_story_info","get_user_info","search_stories"]}',
      );

      const playbook = await gatewayClient.store.get.query({
        playbookId: "test",
      });
      const hackernewsTarget = playbook.servers.find(
        (t) => t.name === "hackernews",
      );

      expect(hackernewsTarget).toBeDefined();
      expect(hackernewsTarget?.tools?.prefix).toBe("h_");
      expect(hackernewsTarget?.tools?.exclude).toEqual([
        "get_story_info",
        "get_user_info",
        "search_stories",
      ]);
    });

    test("should be able to disable a server", async () => {
      await runCLICommand(
        "add",
        "test",
        "--name",
        "custom-fetch",
        "--command",
        "uvx mcp-server-fetch",
      );

      await runCLICommand(
        "update",
        "test",
        "custom-fetch",
        "-a",
        "disabled=true",
      );

      const playbook = await gatewayClient.store.get.query({
        playbookId: "test",
      });
      const customFetchTarget = playbook.servers.find(
        (t) => t.name === "custom-fetch",
      );

      expect(customFetchTarget).toBeDefined();
      expect(customFetchTarget?.disabled).toBe(true);
    });

    test("should be able to update playbook-level attributes", async () => {
      await runCLICommand(
        "update",
        "test",
        "-a",
        "description=Test playbook for integration tests",
      );

      const playbook = await gatewayClient.store.get.query({
        playbookId: "test",
      });
      expect(playbook.description).toBe("Test playbook for integration tests");
    });

    test("should fail when updating non-existent server", async () => {
      const result = await runCLICommand(
        "update",
        "test",
        "non-existent",
        "-a",
        "disabled=true",
      );
      // The command should complete but with an error message
      expect(result.stdout).toContain("Target non-existent does not exists");
    });
  });

  describe("playbook lifecycle", () => {
    test("should be able to list playbooks", async () => {
      await runCLICommand("create", "test1");
      await runCLICommand("create", "test2");

      const playbooks = await gatewayClient.store.getAll.query();
      expect(playbooks).toHaveLength(2);
      expect(playbooks).toContainEqual(
        expect.objectContaining({ id: "test1" }),
      );
      expect(playbooks).toContainEqual(
        expect.objectContaining({ id: "test2" }),
      );
    });

    test("should be able to get playbook details", async () => {
      await runCLICommand("create", "test");
      await runCLICommand("add", "test", "--entry", "hackernews");

      const playbook = await gatewayClient.store.get.query({
        playbookId: "test",
      });
      expect(playbook.id).toBe("test");
      expect(playbook.name).toBe("test");
      expect(playbook.servers).toHaveLength(1);
      expect(playbook.servers[0].name).toBe("hackernews");
    });

    test("should be able to delete a playbook", async () => {
      await runCLICommand("create", "test");

      await runCLICommand("destroy", "test");

      const playbooks = await gatewayClient.store.getAll.query();
      expect(playbooks).toHaveLength(0);
    });
  });

  describe("server management", () => {
    beforeEach(async () => {
      await runCLICommand("create", "test");
    });

    test("should be able to remove a server from a playbook", async () => {
      await runCLICommand("add", "test", "--entry", "hackernews");
      await runCLICommand(
        "add",
        "test",
        "--name",
        "custom-fetch",
        "--command",
        "uvx mcp-server-fetch",
      );

      await runCLICommand("remove", "test", "hackernews");

      const playbook = await gatewayClient.store.get.query({
        playbookId: "test",
      });
      expect(playbook.servers).toHaveLength(1);
      expect(playbook.servers[0].name).toBe("custom-fetch");
    });

    test("should be able to get server details", async () => {
      await runCLICommand("add", "test", "--entry", "hackernews");

      const server = await gatewayClient.store.getServer.query({
        playbookId: "test",
        serverName: "hackernews",
      });

      expect(server.name).toBe("hackernews");
      expect(server.type).toBe("stdio");
    });
  });
});

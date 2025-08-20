import { ChildProcess } from "node:child_process";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { gatewayClient } from "./client";
import { runCLICommand, runCLIServe } from "./test/helpers";

describe("CLI integration tests", () => {
  let serveProcess: ChildProcess;
  beforeAll(async () => {
    try {
      serveProcess = await runCLIServe({ verbose: false, timeout: 30000 });
    } catch (error) {
      console.error("Failed to start gateway server:", error);
      throw error;
    }
  }, 60000);

  afterAll(() => {
    if (serveProcess) {
      serveProcess.kill();
    }
  });

  beforeEach(async () => {
    await gatewayClient.store.purge.mutate();
  });

  test("should be able to create a proxy server", async () => {
    await runCLICommand("create", "test");
    expect(await gatewayClient.store.getAll.query()).toContainEqual(
      expect.objectContaining({
        id: "test",
        name: "test",
      }),
    );
  });

  describe("adding a server to a proxy", () => {
    beforeEach(async () => {
      await runCLICommand("create", "test");
    });

    test("should be able to add a server from the registry", async () => {
      await runCLICommand("add", "test", "--entry", "hackernews");

      const proxy = await gatewayClient.store.get.query({ proxyId: "test" });
      expect(proxy.targets).toContainEqual(
        expect.objectContaining({
          name: "hackernews",
          transport: expect.objectContaining({
            type: "stdio",
            command: "uvx",
            args: [
              "--from",
              "git+https://github.com/erithwik/mcp-hn",
              "mcp-hn",
            ],
          }),
        }),
      );
    });

    test("should be able to add a server using a command", async () => {
      await runCLICommand(
        "add",
        "test",
        "--name",
        "custom-fetch",
        "--command",
        "uvx mcp-server-fetch",
      );

      const proxy = await gatewayClient.store.get.query({ proxyId: "test" });
      expect(proxy.targets).toContainEqual(
        expect.objectContaining({
          name: "custom-fetch",
          transport: expect.objectContaining({
            type: "stdio",
            command: "uvx",
            args: ["mcp-server-fetch"],
          }),
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

      const proxy = await gatewayClient.store.get.query({ proxyId: "test" });
      expect(proxy.targets).toContainEqual(
        expect.objectContaining({
          name: "notion",
          transport: expect.objectContaining({
            type: "http",
            url: "https://mcp.notion.com/mcp",
          }),
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

  describe("updating a proxy", () => {
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
        "toolPrefix=h_",
        "-a",
        'disabledTools=["get_story_info", "get_user_info", "search_stories"]',
      );

      const proxy = await gatewayClient.store.get.query({ proxyId: "test" });
      const hackernewsTarget = proxy.targets.find(
        (t) => t.name === "hackernews",
      );

      expect(hackernewsTarget).toBeDefined();
      expect(hackernewsTarget?.toolPrefix).toBe("h_");
      expect(hackernewsTarget?.disabledTools).toEqual([
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

      const proxy = await gatewayClient.store.get.query({ proxyId: "test" });
      const customFetchTarget = proxy.targets.find(
        (t) => t.name === "custom-fetch",
      );

      expect(customFetchTarget).toBeDefined();
      expect(customFetchTarget?.disabled).toBe(true);
    });

    test("should be able to update proxy-level attributes", async () => {
      await runCLICommand(
        "update",
        "test",
        "-a",
        "description=Test proxy for integration tests",
      );

      const proxy = await gatewayClient.store.get.query({ proxyId: "test" });
      expect(proxy.description).toBe("Test proxy for integration tests");
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

  describe("proxy lifecycle", () => {
    test("should be able to list proxies", async () => {
      await runCLICommand("create", "test1");
      await runCLICommand("create", "test2");

      const proxies = await gatewayClient.store.getAll.query();
      expect(proxies).toHaveLength(2);
      expect(proxies).toContainEqual(expect.objectContaining({ id: "test1" }));
      expect(proxies).toContainEqual(expect.objectContaining({ id: "test2" }));
    });

    test("should be able to get proxy details", async () => {
      await runCLICommand("create", "test");
      await runCLICommand("add", "test", "--entry", "hackernews");

      const proxy = await gatewayClient.store.get.query({ proxyId: "test" });
      expect(proxy.id).toBe("test");
      expect(proxy.name).toBe("test");
      expect(proxy.targets).toHaveLength(1);
      expect(proxy.targets[0].name).toBe("hackernews");
    });

    test("should be able to delete a proxy", async () => {
      await runCLICommand("create", "test");

      await runCLICommand("destroy", "test");

      const proxies = await gatewayClient.store.getAll.query();
      expect(proxies).toHaveLength(0);
    });
  });

  describe("server management", () => {
    beforeEach(async () => {
      await runCLICommand("create", "test");
    });

    test("should be able to remove a server from a proxy", async () => {
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

      const proxy = await gatewayClient.store.get.query({ proxyId: "test" });
      expect(proxy.targets).toHaveLength(1);
      expect(proxy.targets[0].name).toBe("custom-fetch");
    });

    test("should be able to get server details", async () => {
      await runCLICommand("add", "test", "--entry", "hackernews");

      const server = await gatewayClient.store.getServer.query({
        proxyId: "test",
        serverName: "hackernews",
      });

      expect(server.name).toBe("hackernews");
      expect(server.transport.type).toBe("stdio");
    });
  });
});

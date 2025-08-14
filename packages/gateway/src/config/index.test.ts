import fs from "node:fs";
import path from "node:path";
import {
  type HTTPTransport,
  type PromptAttributes,
  type ProxyTargetAttributes,
} from "@director.run/utilities/schema";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { YAMLConfig } from "./index";

describe("Config", () => {
  let db: YAMLConfig;
  const dbPath = path.join(__dirname, "./config.test.yaml");

  beforeAll(async () => {
    if (fs.existsSync(dbPath)) {
      await fs.promises.unlink(dbPath);
    }
    db = await YAMLConfig.connect(dbPath);
  });

  beforeEach(async () => {
    await db.purge();
  });

  afterEach(async () => {
    await db.purge();
  });

  describe("connect", () => {
    it("should create a new database file if it doesn't exist", async () => {
      const newDbPath = path.join(__dirname, "./new-db.test.json");

      // Ensure the file doesn't exist
      if (fs.existsSync(newDbPath)) {
        await fs.promises.unlink(newDbPath);
      }

      const newDb = await YAMLConfig.connect(newDbPath);

      expect(fs.existsSync(newDbPath)).toBe(true);
      expect(newDb.filePath).toBe(newDbPath);

      // Clean up
      await fs.promises.unlink(newDbPath);
    });

    it("should connect to existing database file", async () => {
      // Create a database first
      const existingDb = await YAMLConfig.connect(dbPath);
      await existingDb.addProxy({
        name: "test-proxy",
        description: "Test proxy",
        servers: [],
      });

      // Connect to the same file
      const connectedDb = await YAMLConfig.connect(dbPath);
      const proxies = await connectedDb.getAll();

      expect(proxies).toHaveLength(1);
      expect(proxies[0].name).toBe("test-proxy");
    });
  });

  describe("addProxy", () => {
    it("should add a new proxy successfully", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);

      expect(addedProxy.id).toBe("test-proxy");
      expect(addedProxy.name).toBe("test-proxy");
      expect(addedProxy.description).toBe("A test proxy");
      expect(addedProxy.servers).toHaveLength(0);
    });

    it("should add a proxy with servers", async () => {
      const proxyData = {
        name: "test-proxy-with-servers",
        description: "A test proxy with servers",
        servers: [
          {
            name: "server-1",
            transport: {
              type: "http" as const,
              url: "https://example.com",
            },
          },
          {
            name: "server-2",
            transport: {
              type: "stdio" as const,
              command: "echo",
              args: ["hello"],
            },
          },
        ],
      };

      const addedProxy = await db.addProxy(proxyData);

      expect(addedProxy.id).toBe("test-proxy-with-servers");
      expect(addedProxy.servers).toHaveLength(2);
      expect(addedProxy.servers[0].name).toBe("server-1");
      expect(addedProxy.servers[1].name).toBe("server-2");
    });

    it("should slugify server names", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [
          {
            name: "Server Name With Spaces",
            transport: {
              type: "http" as const,
              url: "https://example.com",
            },
          },
        ],
      };

      const addedProxy = await db.addProxy(proxyData);

      expect(addedProxy.servers[0].name).toBe("server-name-with-spaces");
    });

    it("should throw error when proxy with same name already exists", async () => {
      const proxyData = {
        name: "duplicate-proxy",
        description: "First proxy",
        servers: [],
      };

      await db.addProxy(proxyData);

      await expect(db.addProxy(proxyData)).rejects.toThrow(
        "Proxy already exists",
      );
    });
  });

  describe("getProxy", () => {
    it("should retrieve an existing proxy", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const retrievedProxy = await db.getProxy(addedProxy.id);

      expect(retrievedProxy).toEqual(addedProxy);
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(db.getProxy("non-existent")).rejects.toThrow(
        "Proxy not found",
      );
    });
  });

  describe("deleteProxy", () => {
    it("should delete an existing proxy", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      await db.deleteProxy(addedProxy.id);

      // Verify it's deleted
      await expect(db.getProxy(addedProxy.id)).rejects.toThrow(
        "Proxy not found",
      );
      expect(await db.countProxies()).toBe(0);
    });

    it("should throw error when trying to delete non-existent proxy", async () => {
      await expect(db.deleteProxy("non-existent")).rejects.toThrow(
        "Proxy not found",
      );
    });
  });

  describe("updateProxy", () => {
    it("should update proxy attributes", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "Original description",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const updatedProxy = await db.updateProxy(addedProxy.id, {
        description: "Updated description",
      });

      expect(updatedProxy.description).toBe("Updated description");
      expect(updatedProxy.name).toBe("test-proxy"); // name should remain unchanged
    });

    it("should update proxy servers", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const newServers: ProxyTargetAttributes[] = [
        {
          name: "new-server",
          transport: {
            type: "http" as const,
            url: "https://example.com",
          },
        },
      ];

      const updatedProxy = await db.updateProxy(addedProxy.id, {
        servers: newServers,
      });

      expect(updatedProxy.servers).toHaveLength(1);
      expect(updatedProxy.servers[0].name).toBe("new-server");
    });

    it("should slugify server names when updating", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const newServers: ProxyTargetAttributes[] = [
        {
          name: "Server With Spaces",
          transport: {
            type: "http" as const,
            url: "https://example.com",
          },
        },
      ];

      const updatedProxy = await db.updateProxy(addedProxy.id, {
        servers: newServers,
      });

      expect(updatedProxy.servers[0].name).toBe("server-with-spaces");
    });

    it("should throw error when updating non-existent proxy", async () => {
      await expect(
        db.updateProxy("non-existent", { description: "test" }),
      ).rejects.toThrow("Proxy not found");
    });
  });

  describe("countProxies", () => {
    it("should return 0 for empty database", async () => {
      expect(await db.countProxies()).toBe(0);
    });

    it("should return correct count after adding proxies", async () => {
      await db.addProxy({
        name: "proxy-1",
        description: "First proxy",
        servers: [],
      });

      expect(await db.countProxies()).toBe(1);

      await db.addProxy({
        name: "proxy-2",
        description: "Second proxy",
        servers: [],
      });

      expect(await db.countProxies()).toBe(2);
    });

    it("should return correct count after deleting proxies", async () => {
      const proxy1 = await db.addProxy({
        name: "proxy-1",
        description: "First proxy",
        servers: [],
      });

      const proxy2 = await db.addProxy({
        name: "proxy-2",
        description: "Second proxy",
        servers: [],
      });

      expect(await db.countProxies()).toBe(2);

      await db.deleteProxy(proxy1.id);
      expect(await db.countProxies()).toBe(1);

      await db.deleteProxy(proxy2.id);
      expect(await db.countProxies()).toBe(0);
    });
  });

  describe("updateServer", () => {
    it("should update server attributes", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [
          {
            name: "server-1",
            transport: {
              type: "http" as const,
              url: "https://example.com",
            },
          },
        ],
      };

      const addedProxy = await db.addProxy(proxyData);
      const updatedServer = await db.updateServer(addedProxy.id, "server-1", {
        transport: {
          type: "http" as const,
          url: "https://updated-example.com",
        },
      });

      expect((updatedServer.transport as HTTPTransport).url).toBe(
        "https://updated-example.com",
      );
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(
        db.updateServer("non-existent", "server-1", {}),
      ).rejects.toThrow("Proxy not found");
    });

    it("should throw error when server doesn't exist", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      await expect(
        db.updateServer(addedProxy.id, "non-existent", {}),
      ).rejects.toThrow("Server not found");
    });

    it("should be able to unset attributes", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [
          {
            name: "server-1",
            transport: {
              type: "http" as const,
              url: "https://example.com",
            },
            toolPrefix: "test-prefix",
            disabledTools: ["tool1", "tool2"],
          },
        ],
      };

      const addedProxy = await db.addProxy(proxyData);

      // First, verify the server has the initial attributes
      const initialServer = await db.getServer(addedProxy.id, "server-1");
      expect(initialServer.toolPrefix).toBe("test-prefix");
      expect(initialServer.disabledTools).toEqual(["tool1", "tool2"]);

      // Now unset the attributes
      const updatedServer = await db.updateServer(addedProxy.id, "server-1", {
        toolPrefix: "",
        disabledTools: [],
      });

      // Verify the attributes were unset
      expect(updatedServer.toolPrefix).toBe("");
      expect(updatedServer.disabledTools).toEqual([]);

      // Verify the changes are persisted by retrieving the server again
      const retrievedServer = await db.getServer(addedProxy.id, "server-1");
      expect(retrievedServer.toolPrefix).toBe("");
      expect(retrievedServer.disabledTools).toEqual([]);
    });
  });

  describe("getServer", () => {
    it("should retrieve an existing server", async () => {
      const serverData: ProxyTargetAttributes = {
        name: "server-1",
        transport: {
          type: "http" as const,
          url: "https://example.com",
        },
      };

      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [serverData],
      };

      const addedProxy = await db.addProxy(proxyData);
      const retrievedServer = await db.getServer(addedProxy.id, "server-1");

      expect(retrievedServer).toEqual(serverData);
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(db.getServer("non-existent", "server-1")).rejects.toThrow(
        "Proxy not found",
      );
    });

    it("should throw error when server doesn't exist", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      await expect(db.getServer(addedProxy.id, "non-existent")).rejects.toThrow(
        "Server not found",
      );
    });
  });

  describe("addServer", () => {
    it("should add a server to an existing proxy", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const serverData: ProxyTargetAttributes = {
        name: "new-server",
        transport: {
          type: "stdio" as const,
          command: "echo",
          args: ["hello"],
        },
      };

      const addedServer = await db.addServer(addedProxy.id, serverData);

      expect(addedServer).toEqual(serverData);

      // Verify the server was added to the proxy
      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.servers).toHaveLength(1);
      expect(updatedProxy.servers[0]).toEqual(serverData);
    });

    it("should add multiple servers to a proxy", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const server1: ProxyTargetAttributes = {
        name: "server-1",
        transport: {
          type: "http" as const,
          url: "https://example1.com",
        },
      };

      const server2: ProxyTargetAttributes = {
        name: "server-2",
        transport: {
          type: "stdio" as const,
          command: "echo",
          args: ["hello"],
        },
      };

      await db.addServer(addedProxy.id, server1);
      await db.addServer(addedProxy.id, server2);

      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.servers).toHaveLength(2);
      expect(updatedProxy.servers[0]).toEqual(server1);
      expect(updatedProxy.servers[1]).toEqual(server2);
    });
  });

  describe("removeServer", () => {
    it("should remove a server from a proxy", async () => {
      const serverData: ProxyTargetAttributes = {
        name: "server-to-remove",
        transport: {
          type: "http" as const,
          url: "https://example.com",
        },
      };

      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [serverData],
      };

      const addedProxy = await db.addProxy(proxyData);
      const removed = await db.removeServer(addedProxy.id, "server-to-remove");

      expect(removed).toBe(true);

      // Verify the server was removed
      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.servers).toHaveLength(0);
    });

    it("should remove server case-insensitively", async () => {
      const serverData: ProxyTargetAttributes = {
        name: "Server-Name",
        transport: {
          type: "http" as const,
          url: "https://example.com",
        },
      };

      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [serverData],
      };

      const addedProxy = await db.addProxy(proxyData);
      const removed = await db.removeServer(addedProxy.id, "server-name");

      expect(removed).toBe(true);

      // Verify the server was removed
      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.servers).toHaveLength(0);
    });

    it("should return true even if server doesn't exist", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const removed = await db.removeServer(addedProxy.id, "non-existent");

      expect(removed).toBe(true);
    });
  });

  describe("getAll", () => {
    it("should return empty array for empty database", async () => {
      const allProxies = await db.getAll();
      expect(allProxies).toEqual([]);
    });

    it("should return all proxies", async () => {
      const proxy1 = await db.addProxy({
        name: "proxy-1",
        description: "First proxy",
        servers: [],
      });

      const proxy2 = await db.addProxy({
        name: "proxy-2",
        description: "Second proxy",
        servers: [
          {
            name: "server-1",
            transport: {
              type: "http" as const,
              url: "https://example.com",
            },
          },
        ],
      });

      const allProxies = await db.getAll();

      expect(allProxies).toHaveLength(2);
      expect(allProxies).toEqual([proxy1, proxy2]);
    });
  });

  describe("purge", () => {
    it("should clear all data from database", async () => {
      // Add some data first
      await db.addProxy({
        name: "proxy-1",
        description: "First proxy",
        servers: [],
      });

      await db.addProxy({
        name: "proxy-2",
        description: "Second proxy",
        servers: [],
      });

      expect(await db.countProxies()).toBe(2);

      // Purge the database
      await db.purge();

      // Verify it's empty
      expect(await db.countProxies()).toBe(0);
      expect(await db.getAll()).toEqual([]);
    });

    it("should reset database to initial state", async () => {
      // Add some data
      await db.addProxy({
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      });

      await db.purge();

      // Verify we can still add new data after purge
      const newProxy = await db.addProxy({
        name: "new-proxy",
        description: "New proxy after purge",
        servers: [],
      });

      expect(newProxy.name).toBe("new-proxy");
      expect(await db.countProxies()).toBe(1);
    });
  });

  describe("addPrompt", () => {
    it("should add a prompt to a proxy successfully", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const prompt: PromptAttributes = {
        name: "test-prompt",
        title: "Test Prompt",
        description: "A test prompt",
        body: "This is a test prompt body",
      };

      const addedPrompt = await db.addPrompt(addedProxy.id, prompt);

      expect(addedPrompt).toEqual(prompt);

      // Verify the prompt was added to the proxy
      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.prompts).toHaveLength(1);
      expect(updatedProxy.prompts?.[0]).toEqual(prompt);
    });

    it("should add multiple prompts to a proxy", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const prompt1: PromptAttributes = {
        name: "prompt-1",
        title: "First Prompt",
        description: "First test prompt",
        body: "First prompt body",
      };

      const prompt2: PromptAttributes = {
        name: "prompt-2",
        title: "Second Prompt",
        description: "Second test prompt",
        body: "Second prompt body",
      };

      await db.addPrompt(addedProxy.id, prompt1);
      await db.addPrompt(addedProxy.id, prompt2);

      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.prompts).toHaveLength(2);
      expect(updatedProxy.prompts?.[0]).toEqual(prompt1);
      expect(updatedProxy.prompts?.[1]).toEqual(prompt2);
    });

    it("should throw error when proxy doesn't exist", async () => {
      const prompt: PromptAttributes = {
        name: "test-prompt",
        title: "Test Prompt",
        description: "A test prompt",
        body: "This is a test prompt body",
      };

      await expect(db.addPrompt("non-existent", prompt)).rejects.toThrow(
        "Proxy not found",
      );
    });
  });

  describe("getPrompts", () => {
    it("should return empty array when proxy has no prompts", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const prompts = await db.getPrompts(addedProxy.id);

      expect(prompts).toEqual([]);
    });

    it("should return all prompts for a proxy", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const prompt1: PromptAttributes = {
        name: "prompt-1",
        title: "First Prompt",
        description: "First test prompt",
        body: "First prompt body",
      };

      const prompt2: PromptAttributes = {
        name: "prompt-2",
        title: "Second Prompt",
        description: "Second test prompt",
        body: "Second prompt body",
      };

      await db.addPrompt(addedProxy.id, prompt1);
      await db.addPrompt(addedProxy.id, prompt2);

      const prompts = await db.getPrompts(addedProxy.id);

      expect(prompts).toHaveLength(2);
      expect(prompts).toEqual([prompt1, prompt2]);
    });

    it("should convert database prompts to Prompt type correctly", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const prompt: PromptAttributes = {
        name: "test-prompt",
        title: "Test Prompt",
        description: "A test prompt",
        body: "This is a test prompt body",
      };

      await db.addPrompt(addedProxy.id, prompt);
      const retrievedPrompts = await db.getPrompts(addedProxy.id);

      expect(retrievedPrompts).toHaveLength(1);
      expect(retrievedPrompts[0]).toEqual(prompt);
      expect(retrievedPrompts[0].name).toBe("test-prompt"); // name should be preserved
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(db.getPrompts("non-existent")).rejects.toThrow(
        "Proxy not found",
      );
    });
  });

  describe("removePrompt", () => {
    it("should remove a prompt from a proxy", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const prompt: PromptAttributes = {
        name: "prompt-to-remove",
        title: "Prompt to Remove",
        description: "A prompt to remove",
        body: "This prompt will be removed",
      };

      await db.addPrompt(addedProxy.id, prompt);
      const removed = await db.removePrompt(addedProxy.id, "prompt-to-remove");

      expect(removed).toBe(true);

      // Verify the prompt was removed
      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.prompts).toHaveLength(0);
    });

    it("should remove specific prompt when multiple prompts exist", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const prompt1: PromptAttributes = {
        name: "prompt-1",
        title: "First Prompt",
        description: "First test prompt",
        body: "First prompt body",
      };

      const prompt2: PromptAttributes = {
        name: "prompt-2",
        title: "Second Prompt",
        description: "Second test prompt",
        body: "Second prompt body",
      };

      await db.addPrompt(addedProxy.id, prompt1);
      await db.addPrompt(addedProxy.id, prompt2);

      const removed = await db.removePrompt(addedProxy.id, "prompt-1");

      expect(removed).toBe(true);

      // Verify only the specified prompt was removed
      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.prompts).toHaveLength(1);
      expect(updatedProxy.prompts?.[0]).toEqual(prompt2);
    });

    it("should throw error when prompt doesn't exist", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);

      await expect(
        db.removePrompt(addedProxy.id, "non-existent"),
      ).rejects.toThrow("Prompt non-existent not found");
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(
        db.removePrompt("non-existent", "test-prompt"),
      ).rejects.toThrow("Proxy not found");
    });
  });

  describe("updatePrompt", () => {
    it("should update prompt title", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const originalPrompt: PromptAttributes = {
        name: "test-prompt",
        title: "Original Title",
        description: "Original description",
        body: "Original body",
      };

      await db.addPrompt(addedProxy.id, originalPrompt);
      const updatedPrompt = await db.updatePrompt(
        addedProxy.id,
        "test-prompt",
        {
          title: "Updated Title",
        },
      );

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        title: "Updated Title",
      });

      // Verify the prompt was updated in the database
      const updatedProxy = await db.getProxy(addedProxy.id);
      expect(updatedProxy.prompts?.[0]?.title).toBe("Updated Title");
      expect(updatedProxy.prompts?.[0]?.description).toBe(
        "Original description",
      );
      expect(updatedProxy.prompts?.[0]?.body).toBe("Original body");
    });

    it("should update prompt description", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const originalPrompt: PromptAttributes = {
        name: "test-prompt",
        title: "Test Title",
        description: "Original description",
        body: "Original body",
      };

      await db.addPrompt(addedProxy.id, originalPrompt);
      const updatedPrompt = await db.updatePrompt(
        addedProxy.id,
        "test-prompt",
        {
          description: "Updated description",
        },
      );

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        description: "Updated description",
      });
    });

    it("should update prompt body", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const originalPrompt: PromptAttributes = {
        name: "test-prompt",
        title: "Test Title",
        description: "Test description",
        body: "Original body",
      };

      await db.addPrompt(addedProxy.id, originalPrompt);
      const updatedPrompt = await db.updatePrompt(
        addedProxy.id,
        "test-prompt",
        {
          body: "Updated body content",
        },
      );

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        body: "Updated body content",
      });
    });

    it("should update multiple fields at once", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const originalPrompt: PromptAttributes = {
        name: "test-prompt",
        title: "Original Title",
        description: "Original description",
        body: "Original body",
      };

      await db.addPrompt(addedProxy.id, originalPrompt);
      const updatedPrompt = await db.updatePrompt(
        addedProxy.id,
        "test-prompt",
        {
          title: "Updated Title",
          description: "Updated description",
          body: "Updated body",
        },
      );

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        title: "Updated Title",
        description: "Updated description",
        body: "Updated body",
      });
    });

    it("should handle empty update object", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const originalPrompt: PromptAttributes = {
        name: "test-prompt",
        title: "Test Title",
        description: "Test description",
        body: "Test body",
      };

      await db.addPrompt(addedProxy.id, originalPrompt);
      const updatedPrompt = await db.updatePrompt(
        addedProxy.id,
        "test-prompt",
        {},
      );

      expect(updatedPrompt).toEqual(originalPrompt);
    });

    it("should throw error when prompt doesn't exist", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);

      await expect(
        db.updatePrompt(addedProxy.id, "non-existent", { title: "Updated" }),
      ).rejects.toThrow("Prompt non-existent not found");
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(
        db.updatePrompt("non-existent", "test-prompt", { title: "Updated" }),
      ).rejects.toThrow("Proxy not found");
    });

    it("should preserve other prompts when updating one", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await db.addProxy(proxyData);
      const prompt1: PromptAttributes = {
        name: "prompt-1",
        title: "First Prompt",
        description: "First description",
        body: "First body",
      };

      const prompt2: PromptAttributes = {
        name: "prompt-2",
        title: "Second Prompt",
        description: "Second description",
        body: "Second body",
      };

      await db.addPrompt(addedProxy.id, prompt1);
      await db.addPrompt(addedProxy.id, prompt2);

      await db.updatePrompt(addedProxy.id, "prompt-1", {
        title: "Updated First Prompt",
      });

      // Verify prompt1 was updated
      const updatedPrompts = await db.getPrompts(addedProxy.id);
      expect(updatedPrompts).toHaveLength(2);
      expect(updatedPrompts[0]).toEqual({
        ...prompt1,
        title: "Updated First Prompt",
      });
      expect(updatedPrompts[1]).toEqual(prompt2); // prompt2 should remain unchanged
    });
  });
});

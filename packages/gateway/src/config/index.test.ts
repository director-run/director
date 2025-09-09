import fs from "node:fs";
import path from "node:path";
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

  describe("workspaces", () => {
    const workspaceAttribs1 = {
      id: "test-workspace",
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
    const workspaceAttribs2 = {
      id: "test-workspace-2",
      name: "test-proxy-with-servers-2",
      description: "A test proxy with servers 2",
      servers: [],
    };
    describe("set", () => {
      it("should add a workspace", async () => {
        await db.setWorkspace(workspaceAttribs1.id, workspaceAttribs1);
        const retrievedProxy = await db.getWorkspace(workspaceAttribs1.id);
        expect(retrievedProxy).toEqual(workspaceAttribs1);
      });
      it("should throw an error if there is an id mismatch", async () => {
        await expect(
          db.setWorkspace(workspaceAttribs2.id, workspaceAttribs1),
        ).rejects.toThrow("Id mismatch");
      });
    });
    describe("unset", () => {
      it("should delete a workspace", async () => {
        await db.setWorkspace(workspaceAttribs2.id, workspaceAttribs2);
        await db.setWorkspace(workspaceAttribs1.id, workspaceAttribs1);
        await db.unsetWorkspace(workspaceAttribs2.id);
        await expect(db.getWorkspace(workspaceAttribs2.id)).rejects.toThrow(
          "Workspace not found",
        );
      });
    });
    describe("count", () => {
      it("should count the number of workspaces", async () => {
        expect(await db.countWorkspaces()).toBe(0);
        await db.setWorkspace(workspaceAttribs1.id, workspaceAttribs1);
        expect(await db.countWorkspaces()).toBe(1);
        await db.setWorkspace(workspaceAttribs2.id, workspaceAttribs2);
        expect(await db.countWorkspaces()).toBe(2);
        await db.unsetWorkspace(workspaceAttribs2.id);
        expect(await db.countWorkspaces()).toBe(1);
        await db.unsetWorkspace(workspaceAttribs1.id);
        expect(await db.countWorkspaces()).toBe(0);
      });
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

      expect(await db.countWorkspaces()).toBe(2);

      // Purge the database
      await db.purge();

      // Verify it's empty
      expect(await db.countWorkspaces()).toBe(0);
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
      expect(await db.countWorkspaces()).toBe(1);
    });
  });
});

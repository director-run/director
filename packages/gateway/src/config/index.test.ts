import fs from "node:fs";
import path from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { Config } from "./index";

function makeDefaults() {
  return {
    registry: {
      url: "https://registry.director.run",
    },
    server: {
      port: 3673,
    },
    telemetry: {
      writeKey: "test-write-key",
      enabled: true,
    },
    oauth: {
      storage: "disk",
      tokenDirectory: "./tokens",
    },
  };
}

describe("Config", () => {
  let config: Config;
  const configPath = path.join(__dirname, "./config.test.yaml");

  beforeAll(async () => {
    if (fs.existsSync(configPath)) {
      await fs.promises.unlink(configPath);
    }
    config = await Config.createFileBasedConfig({
      filePath: configPath,
      defaults: makeDefaults(),
    });
  });

  afterAll(async () => {
    await fs.promises.unlink(configPath);
  });

  beforeEach(async () => {
    await config.purge();
  });

  afterEach(async () => {
    await config.purge();
  });

  describe("connect", () => {
    it("should connect to existing database file", async () => {
      // Create a database first
      const existingDb = await Config.createFileBasedConfig({
        filePath: configPath,
        defaults: makeDefaults(),
      });
      await existingDb.playbooks.create({
        name: "test-proxy",
        description: "Test proxy",
        servers: [],
      });

      // Connect to the same file
      const connectedDb = await Config.createFileBasedConfig({
        filePath: configPath,
        defaults: makeDefaults(),
      });
      const proxies = await connectedDb.playbooks.all();

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
          type: "http" as const,
          url: "https://example.com",
        },
        {
          name: "server-2",
          type: "stdio" as const,
          command: "echo",
          args: ["hello"],
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
        await config.playbooks.update(workspaceAttribs1.id, workspaceAttribs1);
        const retrievedProxy = await config.playbooks.getPlaybook(
          workspaceAttribs1.id,
        );
        expect(retrievedProxy).toEqual(workspaceAttribs1);
      });
      it("should throw an error if there is an id mismatch", async () => {
        await expect(
          config.playbooks.update(workspaceAttribs2.id, workspaceAttribs1),
        ).rejects.toThrow("Id mismatch");
      });
    });
    describe("unset", () => {
      it("should delete a workspace", async () => {
        await config.playbooks.update(workspaceAttribs2.id, workspaceAttribs2);
        await config.playbooks.update(workspaceAttribs1.id, workspaceAttribs1);
        await config.playbooks.remove(workspaceAttribs2.id);
        await expect(
          config.playbooks.getPlaybook(workspaceAttribs2.id),
        ).rejects.toThrow("Workspace not found");
      });
    });
    describe("count", () => {
      it("should count the number of workspaces", async () => {
        expect(await config.playbooks.count()).toBe(0);
        await config.playbooks.update(workspaceAttribs1.id, workspaceAttribs1);
        expect(await config.playbooks.count()).toBe(1);
        await config.playbooks.update(workspaceAttribs2.id, workspaceAttribs2);
        expect(await config.playbooks.count()).toBe(2);
        await config.playbooks.remove(workspaceAttribs2.id);
        expect(await config.playbooks.count()).toBe(1);
        await config.playbooks.remove(workspaceAttribs1.id);
        expect(await config.playbooks.count()).toBe(0);
      });
    });
  });

  describe("addWorkspace", () => {
    it("should add a new proxy successfully", async () => {
      const proxyData = {
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      };

      const addedProxy = await config.playbooks.create(proxyData);

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
            type: "http" as const,
            url: "https://example.com",
          },
          {
            name: "server-2",
            type: "stdio" as const,
            command: "echo",
            args: ["hello"],
          },
        ],
      };

      const addedProxy = await config.playbooks.create(proxyData);

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
            type: "http" as const,
            url: "https://example.com",
          },
        ],
      };

      const addedProxy = await config.playbooks.create(proxyData);

      expect(addedProxy.servers[0].name).toBe("server-name-with-spaces");
    });

    it("should throw error when proxy with same name already exists", async () => {
      const proxyData = {
        name: "duplicate-proxy",
        description: "First proxy",
        servers: [],
      };

      await config.playbooks.create(proxyData);

      await expect(config.playbooks.create(proxyData)).rejects.toThrow(
        "Workspace with this name already exists",
      );
    });
  });

  describe("getAll", () => {
    it("should return empty array for empty database", async () => {
      const allProxies = await config.playbooks.all();
      expect(allProxies).toEqual([]);
    });

    it("should return all proxies", async () => {
      const proxy1 = await config.playbooks.create({
        name: "proxy-1",
        description: "First proxy",
        servers: [],
      });

      const proxy2 = await config.playbooks.create({
        name: "proxy-2",
        description: "Second proxy",
        servers: [
          {
            name: "server-1",
            type: "http" as const,
            url: "https://example.com",
          },
        ],
      });

      const allProxies = await config.playbooks.all();

      expect(allProxies).toHaveLength(2);
      expect(allProxies).toEqual([proxy1, proxy2]);
    });
  });

  const clientKeys = [
    "clients.claude",
    "clients.claude-code",
    "clients.cursor",
    "clients.vscode",
  ] as const;
  clientKeys.forEach((clientKey) => {
    describe(`clients.${clientKey}`, () => {
      it("should return the list of clients", async () => {
        expect(await config.get(clientKey)).toEqual([]);
      });
      it("should be able to add a client", async () => {
        await config.push(clientKey, "test-workspace");
        expect(await config.get(clientKey)).toEqual(["test-workspace"]);
      });
      it("should be push to the list of clients", async () => {
        await config.push(clientKey, "test-workspace");
        await config.push(clientKey, "test-workspace2");
        await config.set(clientKey, []);
        expect(await config.get(clientKey)).toEqual([]);
      });
      it("should be able to remove a client", async () => {
        await config.push(clientKey, "test-workspace");
        await config.push(clientKey, "test-workspace2");
        await config.remove(clientKey, "test-workspace");
        expect(await config.get(clientKey)).toEqual(["test-workspace2"]);
      });
      it("should be able to find a client", async () => {
        await config.push(clientKey, "test-workspace");
        await config.push(clientKey, "test-workspace2");
        expect(await config.find(clientKey, "test-workspace")).toBe(
          "test-workspace",
        );
        expect(await config.find(clientKey, "test-workspace2")).toBe(
          "test-workspace2",
        );
        expect(await config.find(clientKey, "test-workspace3")).toBeUndefined();
      });
    });
  });

  describe("purge", () => {
    it("should clear all data from database", async () => {
      // Add some data first
      await config.playbooks.create({
        name: "proxy-1",
        description: "First proxy",
        servers: [],
      });

      await config.playbooks.create({
        name: "proxy-2",
        description: "Second proxy",
        servers: [],
      });

      expect(await config.playbooks.count()).toBe(2);

      // Purge the database
      await config.purge();

      // Verify it's empty
      expect(await config.playbooks.count()).toBe(0);
      expect(await config.playbooks.all()).toEqual([]);
    });

    it("should reset database to initial state", async () => {
      // Add some data
      await config.playbooks.create({
        name: "test-proxy",
        description: "A test proxy",
        servers: [],
      });

      await config.purge();

      // Verify we can still add new data after purge
      const newProxy = await config.playbooks.create({
        name: "new-proxy",
        description: "New proxy after purge",
        servers: [],
      });

      expect(newProxy.name).toBe("new-proxy");
      expect(await config.playbooks.count()).toBe(1);
    });
  });
});

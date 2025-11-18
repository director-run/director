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
        name: "test-playbook",
        description: "Test playbook",
        userId: "test-user-id",
        servers: [],
      });

      // Connect to the same file
      const connectedDb = await Config.createFileBasedConfig({
        filePath: configPath,
        defaults: makeDefaults(),
      });
      const playbooks = await connectedDb.playbooks.all();

      expect(playbooks).toHaveLength(1);
      expect(playbooks[0].name).toBe("test-playbook");
    });
  });

  describe("playbooks", () => {
    const playbookAttribs1 = {
      id: "test-playbook",
      name: "test-playbook-with-servers",
      description: "A test playbook with servers",
      userId: "test-user-id",
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
    const playbookAttribs2 = {
      id: "test-playbook-2",
      name: "test-playbook-with-servers-2",
      description: "A test playbook with servers 2",
      userId: "test-user-id",
      servers: [],
    };
    describe("set", () => {
      it("should add a playbook", async () => {
        await config.playbooks.update(playbookAttribs1.id, playbookAttribs1);
        const retrievedPlaybook = await config.playbooks.getPlaybook(
          playbookAttribs1.id,
        );
        expect(retrievedPlaybook).toEqual(playbookAttribs1);
      });
      it("should throw an error if there is an id mismatch", async () => {
        await expect(
          config.playbooks.update(playbookAttribs2.id, playbookAttribs1),
        ).rejects.toThrow("Id mismatch");
      });
    });
    describe("unset", () => {
      it("should delete a playbook", async () => {
        await config.playbooks.update(playbookAttribs2.id, playbookAttribs2);
        await config.playbooks.update(playbookAttribs1.id, playbookAttribs1);
        await config.playbooks.remove(playbookAttribs2.id);
        await expect(
          config.playbooks.getPlaybook(playbookAttribs2.id),
        ).rejects.toThrow("Playbook not found");
      });
    });
    describe("count", () => {
      it("should count the number of playbooks", async () => {
        expect(await config.playbooks.count()).toBe(0);
        await config.playbooks.update(playbookAttribs1.id, playbookAttribs1);
        expect(await config.playbooks.count()).toBe(1);
        await config.playbooks.update(playbookAttribs2.id, playbookAttribs2);
        expect(await config.playbooks.count()).toBe(2);
        await config.playbooks.remove(playbookAttribs2.id);
        expect(await config.playbooks.count()).toBe(1);
        await config.playbooks.remove(playbookAttribs1.id);
        expect(await config.playbooks.count()).toBe(0);
      });
    });
  });

  describe("addPlaybook", () => {
    it("should add a new playbook successfully", async () => {
      const playbookData = {
        name: "test-playbook",
        description: "A test playbook",
        userId: "test-user-id",
        servers: [],
      };

      const addedPlaybook = await config.playbooks.create(playbookData);

      expect(addedPlaybook.id).toBe("test-playbook");
      expect(addedPlaybook.name).toBe("test-playbook");
      expect(addedPlaybook.description).toBe("A test playbook");
      expect(addedPlaybook.servers).toHaveLength(0);
    });

    it("should add a playbook with servers", async () => {
      const playbookData = {
        name: "test-playbook-with-servers",
        description: "A test playbook with servers",
        userId: "test-user-id",
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

      const addedPlaybook = await config.playbooks.create(playbookData);

      expect(addedPlaybook.id).toBe("test-playbook-with-servers");
      expect(addedPlaybook.servers).toHaveLength(2);
      expect(addedPlaybook.servers[0].name).toBe("server-1");
      expect(addedPlaybook.servers[1].name).toBe("server-2");
    });

    it("should slugify server names", async () => {
      const playbookData = {
        name: "test-playbook",
        description: "A test playbook",
        userId: "test-user-id",
        servers: [
          {
            name: "Server Name With Spaces",
            type: "http" as const,
            url: "https://example.com",
          },
        ],
      };

      const addedPlaybook = await config.playbooks.create(playbookData);

      expect(addedPlaybook.servers[0].name).toBe("server-name-with-spaces");
    });

    it("should throw error when playbook with same name already exists", async () => {
      const playbookData = {
        name: "duplicate-playbook",
        description: "First playbook",
        userId: "test-user-id",
        servers: [],
      };

      await config.playbooks.create(playbookData);

      await expect(config.playbooks.create(playbookData)).rejects.toThrow(
        "Playbook with this name already exists",
      );
    });
  });

  describe("getAll", () => {
    it("should return empty array for empty database", async () => {
      const allPlaybooks = await config.playbooks.all();
      expect(allPlaybooks).toEqual([]);
    });

    it("should return all playbooks", async () => {
      const playbook1 = await config.playbooks.create({
        name: "playbook-1",
        description: "First playbook",
        userId: "test-user-id",
        servers: [],
      });

      const playbook2 = await config.playbooks.create({
        name: "playbook-2",
        description: "Second playbook",
        userId: "test-user-id",
        servers: [
          {
            name: "server-1",
            type: "http" as const,
            url: "https://example.com",
          },
        ],
      });

      const allPlaybooks = await config.playbooks.all();

      expect(allPlaybooks).toHaveLength(2);
      expect(allPlaybooks).toEqual([playbook1, playbook2]);
    });
  });

  describe("purge", () => {
    it("should clear all data from database", async () => {
      // Add some data first
      await config.playbooks.create({
        name: "playbook-1",
        description: "First playbook",
        userId: "test-user-id",
        servers: [],
      });

      await config.playbooks.create({
        name: "playbook-2",
        description: "Second playbook",
        userId: "test-user-id",
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
        name: "test-playbook",
        description: "A test playbook",
        userId: "test-user-id",
        servers: [],
      });

      await config.purge();

      // Verify we can still add new data after purge
      const newPlaybook = await config.playbooks.create({
        name: "new-playbook",
        description: "New playbook after purge",
        userId: "test-user-id",
        servers: [],
      });

      expect(newPlaybook.name).toBe("new-playbook");
      expect(await config.playbooks.count()).toBe(1);
    });
  });
});

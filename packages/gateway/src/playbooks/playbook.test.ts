import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Database } from "../db/database";
import { env } from "../env";
import { createTestUser, initializeTestDatabase } from "../test/db";
import { makeFooBarServerStdioConfig } from "../test/fixtures";
import { Playbook } from "./playbook";

describe("Playbook", async () => {
  let database: Database;
  let playbook: Playbook;
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    database = Database.create(env.DATABASE_URL);
    await initializeTestDatabase({ database, keepUsers: false });
    testUser = await createTestUser(database);
  });

  afterAll(async () => {
    await database.close();
  });

  beforeEach(async () => {
    // Clear playbooks only, keep user
    await initializeTestDatabase({ database, keepUsers: true });

    // Create a test playbook
    const created = await database.createPlaybook({
      name: "test-playbook",
      userId: testUser.id,
    });

    playbook = await Playbook.fromConfig(
      {
        id: created.id,
        name: "test-playbook",
        userId: testUser.id,
        servers: [],
      },
      {
        database,
      },
    );
  });

  describe("addTarget", () => {
    it("should persist changes to the database", async () => {
      const target = await playbook.addTarget(makeFooBarServerStdioConfig());
      expect(target.name).toBe("foo");

      expect(playbook.targets).toHaveLength(2); // 1 server + 1 prompt manager

      const servers = await database.getServers(playbook.id);
      expect(servers).toHaveLength(1);
      expect(servers[0].name).toBe("foo");
    });
  });

  describe("removeTarget", () => {
    it("should persist changes to the database", async () => {
      await playbook.addTarget(makeFooBarServerStdioConfig());

      const removedTarget = await playbook.removeTarget("foo");
      expect(playbook.targets).toHaveLength(1); // Only prompt manager remains
      expect(removedTarget.status).toBe("disconnected");

      const servers = await database.getServers(playbook.id);
      expect(servers).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should persist target changes to the database", async () => {
      await playbook.addTarget(makeFooBarServerStdioConfig());

      const servers = await database.getServers(playbook.id);
      expect(servers).toHaveLength(1);
      expect(servers[0].name).toBe("foo");
    });

    it("should persist playbook changes to the database", async () => {
      await playbook.addTarget(makeFooBarServerStdioConfig());
      await playbook.update({
        name: "test-playbook-updated",
        description: "test-playbook-updated",
      });
      expect(playbook.name).toBe("test-playbook-updated");
      expect(playbook.description).toBe("test-playbook-updated");

      const playbookData = await database.getPlaybookById(
        playbook.id,
        testUser.id,
      );

      expect(playbookData.name).toBe("test-playbook-updated");
      expect(playbookData.description).toBe("test-playbook-updated");
    });
  });
});

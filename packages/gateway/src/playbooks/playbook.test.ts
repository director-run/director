import { beforeEach, describe, expect, it } from "vitest";
import { initializeTestDatabase, makeTestDatabase } from "../test/db";
import { makeFooBarServerStdioConfig } from "../test/fixtures";
import { Playbook } from "./playbook";

describe("Playbook", async () => {
  const database = makeTestDatabase();
  let playbook: Playbook;
  const userId = "dummy-user-id";

  beforeEach(async () => {
    // Clear the database and create dummy user
    await initializeTestDatabase({ keepUsers: true });

    // Create a test playbook
    const created = await database.createPlaybook({
      name: "test-playbook",
      userId,
    });

    playbook = await Playbook.fromConfig(
      {
        id: created.id,
        name: "test-playbook",
        userId,
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

      const playbookData = await database.getPlaybookById(playbook.id, userId);

      expect(playbookData.name).toBe("test-playbook-updated");
      expect(playbookData.description).toBe("test-playbook-updated");
    });
  });
});

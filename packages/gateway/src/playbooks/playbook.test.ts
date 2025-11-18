import { beforeEach, describe, expect, it } from "vitest";
import { Config } from "../config";
import { makeTestConfig } from "../test/config";
import { makeFooBarServerStdioConfig } from "../test/fixtures";
import { Playbook } from "./playbook";

describe("Playbook", async () => {
  const config: Config = await makeTestConfig();
  let playbook: Playbook;

  beforeEach(async () => {
    playbook = await Playbook.fromConfig(
      {
        id: "test-playbook",
        name: "test-playbook",
        userId: "test-user-id",
        servers: [],
      },
      {
        config,
      },
    );
  });

  describe("addTarget", () => {
    it("should persist changes to the config file", async () => {
      const target = await playbook.addTarget(makeFooBarServerStdioConfig());
      expect(target.name).toBe("foo");

      expect(playbook.targets).toHaveLength(2); // 1 server + 1 prompt manager

      const playbookEntry = await config.playbooks.getPlaybook("test-playbook");
      expect(playbookEntry.servers).toHaveLength(1);
      expect(playbookEntry.servers[0].name).toBe("foo");
    });
  });

  describe("removeTarget", () => {
    it("should persist changes to the config file", async () => {
      await playbook.addTarget(makeFooBarServerStdioConfig());

      const removedTarget = await playbook.removeTarget("foo");
      expect(playbook.targets).toHaveLength(1); // Only prompt manager remains
      expect(removedTarget.status).toBe("disconnected");

      const playbookEntry = await config.playbooks.getPlaybook("test-playbook");
      expect(playbookEntry.servers).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should persist target changes to the config", async () => {
      await playbook.addTarget(makeFooBarServerStdioConfig());
      const playbookEntry = await config.playbooks.getPlaybook("test-playbook");

      expect(playbookEntry.servers).toHaveLength(1);
      expect(playbookEntry.servers[0].name).toBe("foo");
    });

    it("should persist playbook changes to the config", async () => {
      await playbook.addTarget(makeFooBarServerStdioConfig());
      await playbook.update({
        name: "test-playbook-updated",
        description: "test-playbook-updated",
      });
      expect(playbook.name).toBe("test-playbook-updated");
      expect(playbook.description).toBe("test-playbook-updated");

      const playbookEntry = await config.playbooks.getPlaybook("test-playbook");

      expect(playbookEntry.name).toBe("test-playbook-updated");
      expect(playbookEntry.description).toBe("test-playbook-updated");
    });
  });
});

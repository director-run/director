import { TRPCClientError } from "@trpc/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "./client";
import { IntegrationTestHarness } from "./test/integration";

describe("Playbook CRUD operations", () => {
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
    beforeAll(async () => {
      await harness.initializeDatabase(true);
    });

    it("should get all playbooks", async () => {
      expect(await harness.client.store.getAll.query()).toHaveLength(0);
      await harness.client.store.create.mutate({
        name: "Test playbook",
      });
      await harness.client.store.create.mutate({
        name: "Test playbook 2",
      });
      const playbooks = await harness.client.store.getAll.query();
      expect(playbooks).toHaveLength(2);

      expect(playbooks[0].id).toBe("test-playbook");
      expect(playbooks[1].id).toBe("test-playbook-2");
    });
  });

  describe("create", () => {
    beforeAll(async () => {
      await harness.initializeDatabase(true);
      await harness.client.store.create.mutate({
        name: "Test playbook",
        description: "Test description",
      });
    });

    it("should add the playbook to the gateway", async () => {
      expect(await harness.client.store.getAll.query()).toHaveLength(1);
      const playbook = await harness.client.store.get.query({
        playbookId: "test-playbook",
      });
      expect(playbook).toBeDefined();
      expect(playbook?.id).toBe("test-playbook");
      expect(playbook?.name).toBe("Test playbook");
      expect(playbook?.description).toBe("Test description");
    });

    it("update the configuration file", async () => {
      expect(
        await harness.database
          .getAllPlaybooks(harness.getUserId())
          .then((p) => p.length),
      ).toBe(1);
      const configEntry = await harness.database.getPlaybookWithDetails(
        "test-playbook",
        harness.getUserId(),
      );
      expect(configEntry).toBeDefined();
      expect(configEntry?.name).toBe("Test playbook");
      expect(configEntry?.description).toBe("Test description");
    });
  });

  describe("update", () => {
    let playbook: GatewayRouterOutputs["store"]["create"];
    beforeEach(async () => {
      await harness.initializeDatabase(true);
      playbook = await harness.client.store.create.mutate({
        name: "Test playbook",
        description: "Old description",
      });
    });

    describe("description", () => {
      it("should update the description", async () => {
        const newDescription = "Updated description";
        const updatedResponse = await harness.client.store.update.mutate({
          playbookId: playbook.id,
          attributes: {
            description: newDescription,
          },
        });
        expect(updatedResponse.description).toBe(newDescription);
        const updatedPlaybook = await harness.client.store.get.query({
          playbookId: "test-playbook",
        });
        expect(updatedPlaybook?.description).toBe(newDescription);
      });
      it("should allow the description to be set to empty string", async () => {
        await harness.client.store.update.mutate({
          playbookId: playbook.id,
          attributes: {
            description: "",
          },
        });
        const updatedPlaybook = await harness.client.store.get.query({
          playbookId: "test-playbook",
        });
        expect(updatedPlaybook?.description).toBe("");
        const configEntry = await harness.database.getPlaybookWithDetails(
          "test-playbook",
          harness.getUserId(),
        );
        expect(configEntry?.description).toBe("");
      });
    });

    describe("name", () => {
      it("should update the name", async () => {
        const newName = "Updated name";
        const updatedResponse = await harness.client.store.update.mutate({
          playbookId: playbook.id,
          attributes: {
            name: newName,
          },
        });
        expect(updatedResponse.name).toBe(newName);
        const updatedPlaybook = await harness.client.store.get.query({
          playbookId: "test-playbook",
        });
        expect(updatedPlaybook?.name).toBe(newName);
      });
      it("should not allow the name to be set to empty string", async () => {
        await expect(
          harness.client.store.update.mutate({
            playbookId: playbook.id,
            attributes: { name: "" },
          }),
        ).rejects.toThrowError(TRPCClientError);

        const updatedPlaybook = await harness.client.store.get.query({
          playbookId: "test-playbook",
        });
        expect(updatedPlaybook?.name).toBe(playbook.name);
        const configEntry = await harness.database.getPlaybookWithDetails(
          "test-playbook",
          harness.getUserId(),
        );
        expect(configEntry?.name).toBe(playbook.name);
      });
    });

    it("should update the configuration file", async () => {
      const newDescription = "Updated description";
      const newName = "Updated name";

      await harness.client.store.update.mutate({
        playbookId: playbook.id,
        attributes: {
          description: newDescription,
          name: newName,
        },
      });
      const configEntry = await harness.database.getPlaybookWithDetails(
        "test-playbook",
        harness.getUserId(),
      );
      expect(configEntry?.description).toBe(newDescription);
      expect(configEntry?.name).toBe(newName);
    });
  });

  describe("delete", () => {
    beforeEach(async () => {
      await harness.initializeDatabase(true);
      await harness.client.store.create.mutate({
        name: "Test playbook",
      });
      await harness.client.store.delete.mutate({
        playbookId: "test-playbook",
      });
    });

    it("should delete the playbook from the gateway", async () => {
      await expect(
        harness.client.store.get.query({ playbookId: "test-playbook" }),
      ).rejects.toThrowError(TRPCClientError);

      expect(await harness.client.store.getAll.query()).toHaveLength(0);
    });

    it("should delete the playbook from the configuration file", async () => {
      expect(
        await harness.database
          .getAllPlaybooks(harness.getUserId())
          .then((p) => p.length),
      ).toBe(0);
    });
  });
});

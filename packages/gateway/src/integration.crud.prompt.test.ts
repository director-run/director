import {} from "@director.run/mcp/test/fixtures";
import {} from "@director.run/mcp/transport";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Prompt } from "./capabilities/prompt-manager";
import type { GatewayRouterOutputs } from "./client";
import { makePrompt } from "./test/fixtures";
import { IntegrationTestHarness } from "./test/integration";

describe("Prompt Capabilities", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("addPrompt", () => {
    let proxy: GatewayRouterOutputs["store"]["create"];
    let prompt: Prompt;
    let addedPrompt: GatewayRouterOutputs["store"]["addPrompt"];

    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });
      prompt = makePrompt();

      addedPrompt = await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt,
      });
    });

    it("should add a prompt successfully", () => {
      expect(addedPrompt).toEqual(prompt);
    });

    it("should update the config file when a prompt is added", async () => {
      const config = await harness.database.getPrompts(proxy.id);
      expect(config).toEqual([prompt]);
    });

    it("should add multiple prompts to a proxy", async () => {
      const prompt2 = makePrompt();

      await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt: prompt2,
      });

      const prompts = await harness.client.store.listPrompts.query({
        proxyId: proxy.id,
      });

      expect(prompts).toHaveLength(2);
      expect(prompts).toEqual([prompt, prompt2]);
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(
        harness.client.store.addPrompt.mutate({
          proxyId: "non-existent",
          prompt,
        }),
      ).rejects.toThrow();
    });
  });

  describe("listPrompts", () => {
    let proxy: GatewayRouterOutputs["store"]["create"];

    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });
    });

    it("should return empty array when proxy has no prompts", async () => {
      const prompts = await harness.client.store.listPrompts.query({
        proxyId: proxy.id,
      });

      expect(prompts).toEqual([]);
    });

    it("should return all prompts for a proxy", async () => {
      const prompt1 = makePrompt();
      const prompt2 = makePrompt();

      await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt: prompt1,
      });

      await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt: prompt2,
      });

      const prompts = await harness.client.store.listPrompts.query({
        proxyId: proxy.id,
      });

      expect(prompts).toHaveLength(2);
      expect(prompts).toEqual([prompt1, prompt2]);
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(
        harness.client.store.listPrompts.query({
          proxyId: "non-existent",
        }),
      ).rejects.toThrow();
    });
  });

  describe("removePrompt", () => {
    let proxy: GatewayRouterOutputs["store"]["create"];
    let prompt: Prompt;
    let result: GatewayRouterOutputs["store"]["removePrompt"];

    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });
      prompt = makePrompt();
      await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt,
      });

      result = await harness.client.store.removePrompt.mutate({
        proxyId: proxy.id,
        promptName: prompt.name,
      });
    });

    it("should remove a prompt from a proxy", async () => {
      expect(result).toBe(true);
      const prompts = await harness.client.store.listPrompts.query({
        proxyId: proxy.id,
      });
      expect(prompts).toHaveLength(0);
    });

    it("should update the config file when a prompt is removed", async () => {
      const config = await harness.database.getPrompts(proxy.id);
      expect(config).toEqual([]);
    });

    it("should remove specific prompt when multiple prompts exist", async () => {
      const prompt1: Prompt = {
        name: "prompt-1",
        title: "First Prompt",
        description: "First test prompt",
        body: "First prompt body",
      };

      const prompt2: Prompt = {
        name: "prompt-2",
        title: "Second Prompt",
        description: "Second test prompt",
        body: "Second prompt body",
      };

      await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt: prompt1,
      });

      await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt: prompt2,
      });

      const result = await harness.client.store.removePrompt.mutate({
        proxyId: proxy.id,
        promptName: "prompt-1",
      });

      expect(result).toBe(true);

      // Verify only the specified prompt was removed
      const prompts = await harness.client.store.listPrompts.query({
        proxyId: proxy.id,
      });
      expect(prompts).toHaveLength(1);
      expect(prompts[0]).toEqual(prompt2);
    });

    it("should throw error when prompt doesn't exist", async () => {
      await expect(
        harness.client.store.removePrompt.mutate({
          proxyId: proxy.id,
          promptName: "non-existent",
        }),
      ).rejects.toThrow();
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(
        harness.client.store.removePrompt.mutate({
          proxyId: "non-existent",
          promptName: "test-prompt",
        }),
      ).rejects.toThrow();
    });
  });

  describe("updatePrompt", () => {
    let proxy: GatewayRouterOutputs["store"]["create"];
    const originalPrompt = makePrompt();

    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });

      await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt: originalPrompt,
      });
    });

    it("should update prompt title", async () => {
      const updatedPrompt = await harness.client.store.updatePrompt.mutate({
        proxyId: proxy.id,
        promptName: originalPrompt.name,
        prompt: {
          title: "Updated Title",
        },
      });

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        title: "Updated Title",
      });

      const prompts = await harness.client.store.listPrompts.query({
        proxyId: proxy.id,
      });

      expect(prompts).toHaveLength(1);
      expect((prompts[0] as Prompt).title).toBe("Updated Title");
      expect((prompts[0] as Prompt).description).toBe(
        originalPrompt.description,
      );
      expect((prompts[0] as Prompt).body).toBe(originalPrompt.body);
    });

    it("should update prompt description", async () => {
      const updatedPrompt = await harness.client.store.updatePrompt.mutate({
        proxyId: proxy.id,
        promptName: originalPrompt.name,
        prompt: {
          description: "Updated description",
        },
      });

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        description: "Updated description",
      });
    });

    it("should update prompt body", async () => {
      const updatedPrompt = await harness.client.store.updatePrompt.mutate({
        proxyId: proxy.id,
        promptName: originalPrompt.name,
        prompt: {
          body: "Updated body content",
        },
      });

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        body: "Updated body content",
      });
    });

    it("should update multiple fields at once", async () => {
      const updatedPrompt = await harness.client.store.updatePrompt.mutate({
        proxyId: proxy.id,
        promptName: originalPrompt.name,
        prompt: {
          title: "Updated Title",
          description: "Updated description",
          body: "Updated body",
        },
      });

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        title: "Updated Title",
        description: "Updated description",
        body: "Updated body",
      });
    });

    it("should update the config file when a prompt is updated", async () => {
      const updatedPrompt = await harness.client.store.updatePrompt.mutate({
        proxyId: proxy.id,
        promptName: originalPrompt.name,
        prompt: {
          title: "Updated Title",
          description: "Updated description",
          body: "Updated body",
        },
      });
      const config = await harness.database.getPrompts(proxy.id);
      expect(config).toEqual([
        {
          name: originalPrompt.name,
          title: "Updated Title",
          description: "Updated description",
          body: "Updated body",
        },
      ]);
    });

    it("should handle empty update object", async () => {
      const updatedPrompt = await harness.client.store.updatePrompt.mutate({
        proxyId: proxy.id,
        promptName: originalPrompt.name,
        prompt: {},
      });

      expect(updatedPrompt).toEqual(originalPrompt);
    });

    it("should throw error when prompt doesn't exist", async () => {
      await expect(
        harness.client.store.updatePrompt.mutate({
          proxyId: proxy.id,
          promptName: "non-existent",
          prompt: { title: "Updated" },
        }),
      ).rejects.toThrow();
    });

    it("should throw error when proxy doesn't exist", async () => {
      await expect(
        harness.client.store.updatePrompt.mutate({
          proxyId: "non-existent",
          promptName: "test-prompt",
          prompt: { title: "Updated" },
        }),
      ).rejects.toThrow();
    });

    it("should preserve other prompts when updating one", async () => {
      const prompt2: Prompt = makePrompt();

      await harness.client.store.addPrompt.mutate({
        proxyId: proxy.id,
        prompt: prompt2,
      });

      await harness.client.store.updatePrompt.mutate({
        proxyId: proxy.id,
        promptName: originalPrompt.name,
        prompt: {
          title: "Updated First Prompt",
        },
      });

      const prompts = await harness.client.store.listPrompts.query({
        proxyId: proxy.id,
      });
      expect(prompts).toHaveLength(2);
      expect(prompts[0]).toEqual({
        ...originalPrompt,
        title: "Updated First Prompt",
      });
      expect(prompts[1]).toEqual(prompt2);
    });
  });
});

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { decrypt } from "../../crypto";
import { env } from "../../env";
import { IntegrationTestHarness } from "../../test/integration";

describe("API Key Router", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  beforeEach(async () => {
    await harness.initializeDatabase();
    await harness.register({
      email: "test@example.com",
      password: "password123",
    });
  });

  describe("getInfo", () => {
    it("should return API key info for authenticated user", async () => {
      const info = await harness.client.apiKey.getInfo.query();

      expect(info.hasApiKey).toBe(true);
      expect(info.keyStart).toBeDefined();
      expect(info.keyStart).toMatch(/^dk_/);
      expect(info.createdAt).toBeDefined();
    });
  });

  describe("regenerate", () => {
    it("should create a new API key and return full key", async () => {
      const result = await harness.client.apiKey.regenerate.mutate();

      expect(result.key).toBeDefined();
      expect(result.key).toMatch(/^dk_/);
      expect(result.keyStart).toBeDefined();
      expect(result.keyStart).toMatch(/^dk_/);
      // keyStart should be a prefix of the full key
      expect(result.key.startsWith(result.keyStart ?? "")).toBe(true);
    });

    it("should update the encrypted API key in the database", async () => {
      // Get original encrypted key
      const userId = harness.getUserId();
      const originalUser = await harness.database.getUser(userId);
      const originalEncryptedKey = originalUser?.encryptedApiKey;
      expect(originalEncryptedKey).toBeDefined();

      // Regenerate the key
      const result = await harness.client.apiKey.regenerate.mutate();

      // Verify encrypted key was updated
      const updatedUser = await harness.database.getUser(userId);
      expect(updatedUser?.encryptedApiKey).toBeDefined();
      expect(updatedUser?.encryptedApiKey).not.toBe(originalEncryptedKey);

      // Verify the decrypted key matches the returned key
      const decryptedKey = decrypt(
        updatedUser?.encryptedApiKey ?? "",
        env.BETTER_AUTH_SECRET,
      );
      expect(decryptedKey).toBe(result.key);
    });

    it("should delete old API keys after regeneration", async () => {
      const userId = harness.getUserId();

      // Get original API keys
      const originalKeys = await harness.database.getApiKeysByUserId(userId);
      expect(originalKeys.length).toBeGreaterThan(0);
      const originalKeyIds = originalKeys.map((k) => k.id);

      // Regenerate the key
      await harness.client.apiKey.regenerate.mutate();

      // Verify old keys were deleted
      const newKeys = await harness.database.getApiKeysByUserId(userId);
      expect(newKeys.length).toBe(1);

      // The new key should have a different ID
      const newKeyId = newKeys[0].id;
      expect(originalKeyIds).not.toContain(newKeyId);
    });

    it("should update getInfo after regeneration", async () => {
      // Get original info
      const originalInfo = await harness.client.apiKey.getInfo.query();
      const originalKeyStart = originalInfo.keyStart;

      // Regenerate the key
      const result = await harness.client.apiKey.regenerate.mutate();

      // Get updated info
      const updatedInfo = await harness.client.apiKey.getInfo.query();

      expect(updatedInfo.hasApiKey).toBe(true);
      expect(updatedInfo.keyStart).toBe(result.keyStart);
      expect(updatedInfo.keyStart).not.toBe(originalKeyStart);
    });

    it("should update connection info after regeneration", async () => {
      // Create a playbook first
      const playbook = await harness.client.store.create.mutate({
        name: "Test Playbook",
      });

      // Get original connection info (key is returned separately)
      const originalConnectionInfo =
        await harness.client.store.getConnectionInfo.query({
          playbookId: playbook.id,
        });

      const originalApiKey = originalConnectionInfo.apiKey;
      expect(originalApiKey).toBeDefined();

      // Regenerate the key
      const result = await harness.client.apiKey.regenerate.mutate();

      // Get updated connection info
      const updatedConnectionInfo =
        await harness.client.store.getConnectionInfo.query({
          playbookId: playbook.id,
        });

      const updatedApiKey = updatedConnectionInfo.apiKey;

      // Verify the API key was updated
      expect(updatedApiKey).toBe(result.key);
      expect(updatedApiKey).not.toBe(originalApiKey);
    });
  });
});

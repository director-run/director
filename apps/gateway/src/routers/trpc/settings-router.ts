import { encrypt } from "@director.run/utilities/crypto";
import { t } from "@director.run/utilities/trpc";
import { auth } from "../../auth";
import { env } from "../../env";
import { type AuthenticatedGatewayContext, protectedProcedure } from "./index";

export function createSettingsRouter() {
  return t.router({
    /**
     * Get all settings for the authenticated user.
     */
    getAllSettings: protectedProcedure.query(async ({ ctx }) => {
      const { database, userId } = ctx as AuthenticatedGatewayContext;

      const user = await database.getUser(userId);
      const hasApiKey = !!user?.encryptedApiKey;

      // Get the key metadata from database
      const keys = await database.getApiKeysByUserId(userId);
      const defaultKey = keys.find((k) => k.name === "default");

      return {
        email: user?.email ?? null,
        apiKey: {
          hasApiKey,
          keyStart: defaultKey?.start ?? null,
          createdAt: defaultKey?.createdAt ?? null,
        },
      };
    }),

    /**
     * Regenerate the user's API key.
     * This creates a new API key, stores it encrypted, and deletes the old one.
     */
    regenerateApiKey: protectedProcedure.mutation(async ({ ctx }) => {
      const { database, userId } = ctx as AuthenticatedGatewayContext;

      // Get existing API keys from database
      const existingKeys = await database.getApiKeysByUserId(userId);

      // Create new API key
      const result = await auth.api.createApiKey({
        body: {
          name: "default",
          userId,
        },
      });

      if (!result.key) {
        throw new Error("Failed to create new API key");
      }

      // Store the encrypted API key
      const encryptedKey = encrypt(result.key, env.BETTER_AUTH_SECRET);
      await database.updateUserEncryptedApiKey(userId, encryptedKey);

      // Delete old API keys (keep only the new one)
      for (const key of existingKeys) {
        if (key.id !== result.id) {
          await database.deleteApiKey(key.id);
        }
      }

      return {
        // Return the full key so user can copy it (shown only once)
        key: result.key,
        // Return just the start of the key for display purposes
        keyStart: result.start,
      };
    }),
  });
}

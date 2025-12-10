import type {
  OAuthClientInformationFull,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { beforeEach, describe, expect, test } from "vitest";
import { env } from "../env";
import { Database } from "./database";
import { DatabaseOAuthStorage } from "./oauth-storage";
import { oauthCredentialsTable, userTable } from "./schema";

describe("DatabaseOAuthStorage", () => {
  let database: Database;
  let storage: DatabaseOAuthStorage;
  const testUserId = "test-user-oauth-storage";
  const testProviderId = "test-provider";

  beforeEach(async () => {
    database = Database.create(env.DATABASE_URL);

    // Clean up any existing test data
    await database.drizzle
      .delete(oauthCredentialsTable)
      .where(undefined)
      .execute();

    await database.drizzle.delete(userTable).where(undefined).execute();

    // Create a test user
    await database.drizzle.insert(userTable).values({
      id: testUserId,
      name: "Test User",
      email: "oauth-test@example.com",
      emailVerified: true,
      status: "ACTIVE",
    });

    storage = new DatabaseOAuthStorage({
      database,
      userId: testUserId,
    });
  });

  describe("clientInformation", () => {
    test("should return undefined when no client information exists", async () => {
      const result = await storage.getClientInformation(testProviderId);
      expect(result).toBeUndefined();
    });

    test("should save and retrieve client information", async () => {
      const clientInfo: OAuthClientInformationFull = {
        client_id: "test-client-id",
        client_secret: "test-client-secret",
        client_id_issued_at: Math.floor(Date.now() / 1000),
        redirect_uris: ["http://localhost:3000/callback"],
      };

      await storage.saveClientInformation(testProviderId, clientInfo);

      const result = await storage.getClientInformation(testProviderId);
      expect(result).toEqual(clientInfo);
    });

    test("should update existing client information", async () => {
      const clientInfo1: OAuthClientInformationFull = {
        client_id: "test-client-id-1",
        client_secret: "test-client-secret-1",
        client_id_issued_at: Math.floor(Date.now() / 1000),
        redirect_uris: ["http://localhost:3000/callback"],
      };

      const clientInfo2: OAuthClientInformationFull = {
        client_id: "test-client-id-2",
        client_secret: "test-client-secret-2",
        client_id_issued_at: Math.floor(Date.now() / 1000),
        redirect_uris: ["http://localhost:3000/callback"],
      };

      await storage.saveClientInformation(testProviderId, clientInfo1);
      await storage.saveClientInformation(testProviderId, clientInfo2);

      const result = await storage.getClientInformation(testProviderId);
      expect(result).toEqual(clientInfo2);
    });
  });

  describe("tokens", () => {
    test("should return undefined when no tokens exist", async () => {
      const result = await storage.getTokens(testProviderId);
      expect(result).toBeUndefined();
    });

    test("should save and retrieve tokens", async () => {
      const tokens: OAuthTokens = {
        access_token: "test-access-token",
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "test-refresh-token",
      };

      await storage.saveTokens(testProviderId, tokens);

      const result = await storage.getTokens(testProviderId);
      expect(result).toEqual(tokens);
    });

    test("should delete tokens", async () => {
      const tokens: OAuthTokens = {
        access_token: "test-access-token",
        token_type: "Bearer",
      };

      await storage.saveTokens(testProviderId, tokens);
      await storage.deleteTokens(testProviderId);

      const result = await storage.getTokens(testProviderId);
      expect(result).toBeUndefined();
    });
  });

  describe("codeVerifier", () => {
    test("should return undefined when no code verifier exists", async () => {
      const result = await storage.getCodeVerifier(testProviderId);
      expect(result).toBeUndefined();
    });

    test("should save and retrieve code verifier", async () => {
      const codeVerifier = "test-code-verifier-123";

      await storage.saveCodeVerifier(testProviderId, codeVerifier);

      const result = await storage.getCodeVerifier(testProviderId);
      expect(result).toBe(codeVerifier);
    });

    test("should clear code verifier when tokens are deleted", async () => {
      const codeVerifier = "test-code-verifier-456";

      await storage.saveCodeVerifier(testProviderId, codeVerifier);
      await storage.deleteTokens(testProviderId);

      const result = await storage.getCodeVerifier(testProviderId);
      expect(result).toBeUndefined();
    });
  });

  describe("user isolation", () => {
    test("credentials should be isolated by user", async () => {
      const otherUserId = "other-user-oauth-storage";

      // Create another test user
      await database.drizzle.insert(userTable).values({
        id: otherUserId,
        name: "Other User",
        email: "other-oauth-test@example.com",
        emailVerified: true,
        status: "ACTIVE",
      });

      const otherStorage = new DatabaseOAuthStorage({
        database,
        userId: otherUserId,
      });

      const tokens1: OAuthTokens = {
        access_token: "user1-token",
        token_type: "Bearer",
      };

      const tokens2: OAuthTokens = {
        access_token: "user2-token",
        token_type: "Bearer",
      };

      // Save tokens for both users with the same provider ID
      await storage.saveTokens(testProviderId, tokens1);
      await otherStorage.saveTokens(testProviderId, tokens2);

      // Verify each user sees their own tokens
      const result1 = await storage.getTokens(testProviderId);
      const result2 = await otherStorage.getTokens(testProviderId);

      expect(result1).toEqual(tokens1);
      expect(result2).toEqual(tokens2);
    });
  });
});

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { faker } from "@faker-js/faker";
import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthProvider, OAuthProviderFactory } from "./oauth-provider-factory";

describe("OAuthProvider", () => {
  describe("with InMemoryOAuthStorage", () => {
    let provider: OAuthProvider;
    let factory: OAuthProviderFactory;

    beforeEach(() => {
      factory = new OAuthProviderFactory({
        storage: "memory",
        baseCallbackUrl: "http://localhost:8080/",
      });
      provider = factory.getProvider({
        providerId: faker.string.uuid(),
      });
    });

    it("should save and load client information", async () => {
      const clientInfo: OAuthClientInformationFull = {
        client_id: "test-client-id",
        client_secret: "test-client-secret",
        client_id_issued_at: 1234567890,
        client_secret_expires_at: 1234567890,
        redirect_uris: ["http://localhost:8080/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "test:scope",
      };

      await provider.saveClientInformation(clientInfo);
      const loaded = await provider.clientInformation();

      expect(loaded).toEqual(clientInfo);
    });

    it("should save and load tokens", async () => {
      const tokens: OAuthTokens = {
        access_token: "test-access-token",
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "test-refresh-token",
        scope: "test:scope",
      };

      await provider.saveTokens(tokens);
      const loaded = await provider.tokens();

      expect(loaded).toEqual(tokens);
    });

    it("should save and load code verifier", async () => {
      const codeVerifier = "test-code-verifier";

      await provider.saveCodeVerifier(codeVerifier);
      const loaded = await provider.codeVerifier();

      expect(loaded).toBe(codeVerifier);
    });

    it("should return undefined for non-existent data", async () => {
      const clientInfo = await provider.clientInformation();
      const tokens = await provider.tokens();

      expect(clientInfo).toBeUndefined();
      expect(tokens).toBeUndefined();
    });

    it("should throw error for non-existent code verifier", async () => {
      await expect(provider.codeVerifier()).rejects.toThrow(
        "No code verifier saved",
      );
    });

    it("should have correct redirect URL and client metadata", () => {
      const urlStr = provider.redirectUrl.toString();
      expect(urlStr.startsWith("http://localhost:8080/oauth/")).toBe(true);
      expect(urlStr.endsWith("/callback")).toBe(true);
      // expect(provider.clientMetadata).toEqual(clientMetadata);
    });

    it("should call onRedirect callback when provided", () => {
      const onRedirect = vi.fn();
      const providerWithCallback = factory.getProvider({
        providerId: "https://provider.example/a",
        onRedirect,
      });

      const authUrl = new URL("https://example.com/auth");
      providerWithCallback.redirectToAuthorization(authUrl);

      expect(onRedirect).toHaveBeenCalledWith(authUrl);
    });

    it("should log redirect URL when no callback is provided", () => {
      const authUrl = new URL("https://example.com/auth");
      provider.redirectToAuthorization(authUrl);
      // Note: We can't easily test the logger output, but we can verify the method doesn't throw
    });

    it("should support multiple providers with separate data", async () => {
      const provider1 = factory.getProvider({
        providerId: faker.string.uuid(),
      });
      const provider2 = factory.getProvider({
        providerId: faker.string.uuid(),
      });

      const clientInfo1: OAuthClientInformationFull = {
        client_id: "client-1",
        client_secret: "secret-1",
        client_id_issued_at: 1234567890,
        client_secret_expires_at: 1234567890,
        redirect_uris: ["http://localhost:8080/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "test:scope",
      };

      const clientInfo2: OAuthClientInformationFull = {
        client_id: "client-2",
        client_secret: "secret-2",
        client_id_issued_at: 1234567890,
        client_secret_expires_at: 1234567890,
        redirect_uris: ["http://localhost:8080/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "test:scope",
      };

      await provider1.saveClientInformation(clientInfo1);
      await provider2.saveClientInformation(clientInfo2);

      const loaded1 = await provider1.clientInformation();
      const loaded2 = await provider2.clientInformation();

      expect(loaded1).toEqual(clientInfo1);
      expect(loaded2).toEqual(clientInfo2);
      expect(loaded1).not.toEqual(loaded2);
    });
  });

  describe("with OnDiskOAuthStorage", () => {
    let tempDir: string;
    let provider: OAuthProvider;
    let factory: OAuthProviderFactory;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "oauth-test-"));
      factory = new OAuthProviderFactory({
        storage: "disk",
        tokenDirectory: tempDir,
        baseCallbackUrl: "http://localhost:8080/",
        filePrefix: "test-oauth",
      });
      provider = factory.getProvider({
        providerId: faker.string.uuid(),
      });
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it("should save and load client information", async () => {
      const clientInfo: OAuthClientInformationFull = {
        client_id: "test-client-id",
        client_secret: "test-client-secret",
        client_id_issued_at: 1234567890,
        client_secret_expires_at: 1234567890,
        redirect_uris: ["http://localhost:8080/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "test:scope",
      };

      await provider.saveClientInformation(clientInfo);
      const loaded = await provider.clientInformation();

      expect(loaded).toEqual(clientInfo);
    });

    it("should save and load tokens", async () => {
      const tokens: OAuthTokens = {
        access_token: "test-access-token",
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "test-refresh-token",
        scope: "test:scope",
      };

      await provider.saveTokens(tokens);
      const loaded = await provider.tokens();

      expect(loaded).toEqual(tokens);
    });

    it("should save and load code verifier", async () => {
      const codeVerifier = "test-code-verifier";

      await provider.saveCodeVerifier(codeVerifier);
      const loaded = await provider.codeVerifier();

      expect(loaded).toBe(codeVerifier);
    });

    it("should return undefined for non-existent data", async () => {
      const clientInfo = await provider.clientInformation();
      const tokens = await provider.tokens();

      expect(clientInfo).toBeUndefined();
      expect(tokens).toBeUndefined();
    });

    it("should throw error for non-existent code verifier", async () => {
      await expect(provider.codeVerifier()).rejects.toThrow(
        "No code verifier saved",
      );
    });

    it("should support multiple providers with separate files", async () => {
      const provider1 = factory.getProvider({
        providerId: faker.string.uuid(),
      });
      const provider2 = factory.getProvider({
        providerId: faker.string.uuid(),
      });

      const clientInfo1: OAuthClientInformationFull = {
        client_id: "client-1",
        client_secret: "secret-1",
        client_id_issued_at: 1234567890,
        client_secret_expires_at: 1234567890,
        redirect_uris: ["http://localhost:8080/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "test:scope",
      };

      const clientInfo2: OAuthClientInformationFull = {
        client_id: "client-2",
        client_secret: "secret-2",
        client_id_issued_at: 1234567890,
        client_secret_expires_at: 1234567890,
        redirect_uris: ["http://localhost:8080/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "test:scope",
      };

      await provider1.saveClientInformation(clientInfo1);
      await provider2.saveClientInformation(clientInfo2);

      const loaded1 = await provider1.clientInformation();
      const loaded2 = await provider2.clientInformation();

      expect(loaded1).toEqual(clientInfo1);
      expect(loaded2).toEqual(clientInfo2);
      expect(loaded1).not.toEqual(loaded2);

      // Check that separate files were created with the filePrefix and encoded IDs
      const files = await fs.readdir(tempDir);
      expect(files).toHaveLength(2);
      for (const f of files) {
        expect(f.startsWith("test-oauth-")).toBe(true);
        expect(f.endsWith(".json")).toBe(true);
      }
    });
  });
});

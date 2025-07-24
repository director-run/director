import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  type OAuthClientInformationFull,
  type OAuthClientMetadata,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  InMemoryOAuthProvider,
  OnDiskOAuthProvider,
} from "./oauth-provider-factory";

describe("OAuth Providers", () => {
  describe("OnDiskOAuthProvider", () => {
    let tempDir: string;
    let provider: OnDiskOAuthProvider;
    const testProviderId = "test-provider";
    const clientMetadata: OAuthClientMetadata = {
      client_name: "Test OAuth Client",
      redirect_uris: ["http://localhost:8080/callback"],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "test:scope",
    };

    beforeEach(async () => {
      // Create a temporary directory for testing
      tempDir = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "oauth-test-"),
      );

      // Mock the data directory to use our temp directory
      const originalGetDataDir = OnDiskOAuthProvider.prototype["_getDataDir"];
      OnDiskOAuthProvider.prototype["_getDataDir"] = () => tempDir;

      provider = new OnDiskOAuthProvider(
        "http://localhost:8080/callback",
        clientMetadata,
        undefined,
        testProviderId,
      );
    });

    afterEach(async () => {
      // Clean up temporary directory
      await fs.promises.rm(tempDir, { recursive: true, force: true });
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
      expect(provider.redirectUrl).toBe("http://localhost:8080/callback");
      expect(provider.clientMetadata).toEqual(clientMetadata);
    });
  });

  describe("InMemoryOAuthProvider", () => {
    let provider: InMemoryOAuthProvider;
    const clientMetadata: OAuthClientMetadata = {
      client_name: "Test OAuth Client",
      redirect_uris: ["http://localhost:8080/callback"],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "test:scope",
    };

    beforeEach(() => {
      provider = new InMemoryOAuthProvider(
        "http://localhost:8080/callback",
        clientMetadata,
      );
    });

    it("should save and load client information", () => {
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

      provider.saveClientInformation(clientInfo);
      const loaded = provider.clientInformation();

      expect(loaded).toEqual(clientInfo);
    });

    it("should save and load tokens", () => {
      const tokens: OAuthTokens = {
        access_token: "test-access-token",
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "test-refresh-token",
        scope: "test:scope",
      };

      provider.saveTokens(tokens);
      const loaded = provider.tokens();

      expect(loaded).toEqual(tokens);
    });

    it("should save and load code verifier", () => {
      const codeVerifier = "test-code-verifier";

      provider.saveCodeVerifier(codeVerifier);
      const loaded = provider.codeVerifier();

      expect(loaded).toBe(codeVerifier);
    });

    it("should return undefined for non-existent data", () => {
      const clientInfo = provider.clientInformation();
      const tokens = provider.tokens();

      expect(clientInfo).toBeUndefined();
      expect(tokens).toBeUndefined();
    });

    it("should throw error for non-existent code verifier", () => {
      expect(() => provider.codeVerifier()).toThrow("No code verifier saved");
    });

    it("should have correct redirect URL and client metadata", () => {
      expect(provider.redirectUrl).toBe("http://localhost:8080/callback");
      expect(provider.clientMetadata).toEqual(clientMetadata);
    });
  });
});

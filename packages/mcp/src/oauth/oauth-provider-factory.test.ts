import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { AppError, ErrorCode } from "@director.run/utilities/error";
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

      provider = new OnDiskOAuthProvider(
        "http://localhost:8080/callback",
        clientMetadata,
        undefined,
        testProviderId,
        tempDir,
        "test-oauth",
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

    it("should persist all data in a single file", async () => {
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
      const tokens: OAuthTokens = {
        access_token: "test-access-token",
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "test-refresh-token",
        scope: "test:scope",
      };
      const codeVerifier = "test-code-verifier";

      await provider.saveClientInformation(clientInfo);
      await provider.saveTokens(tokens);
      await provider.saveCodeVerifier(codeVerifier);

      // Check that only one file was created
      const files = await fs.promises.readdir(tempDir);
      expect(files).toHaveLength(1);
      expect(files[0]).toBe("test-oauth-test-provider.json");

      // Check file permissions (should be 600)
      const filePath = path.join(tempDir, "test-oauth-test-provider.json");
      const stats = fs.statSync(filePath);
      const mode = stats.mode & 0o777;
      expect(mode).toBe(0o600);
    });

    it("should fail when file permissions are insecure", async () => {
      // First save some data to create the file
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

      // Make the file permissions insecure (644 - readable by others)
      const filePath = path.join(tempDir, "test-oauth-test-provider.json");
      fs.chmodSync(filePath, 0o644);

      // Create a new provider instance to force reading from disk
      const newProvider = new OnDiskOAuthProvider(
        "http://localhost:8080/callback",
        clientMetadata,
        undefined,
        testProviderId,
        tempDir,
        "test-oauth",
      );

      // Try to read the file - should fail with permission error
      await expect(newProvider.clientInformation()).rejects.toThrow(AppError);
      await expect(newProvider.clientInformation()).rejects.toMatchObject({
        code: ErrorCode.INSECURE_FILE_PERMISSIONS,
      });
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

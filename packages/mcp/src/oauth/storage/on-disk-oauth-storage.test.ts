import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { OnDiskOAuthStorage } from "./on-disk-oauth-storage";

describe("OnDiskOAuthStorage", () => {
  let tempDir: string;
  let storage: OnDiskOAuthStorage;
  const testProviderId = "test-provider";

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "oauth-test-"));

    storage = new OnDiskOAuthStorage({
      directory: tempDir,
      filePrefix: "test-oauth",
    });
  });

  afterEach(async () => {
    // Clean up temporary directory
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

    await storage.saveClientInformation(testProviderId, clientInfo);
    const loaded = await storage.getClientInformation(testProviderId);

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

    await storage.saveTokens(testProviderId, tokens);
    const loaded = await storage.getTokens(testProviderId);

    expect(loaded).toEqual(tokens);
  });

  it("should delete tokens", async () => {
    const tokens: OAuthTokens = {
      access_token: "test-access-token",
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "test-refresh-token",
      scope: "test:scope",
    };

    await storage.saveTokens(testProviderId, tokens);
    await storage.deleteTokens(testProviderId);

    // Tokens removed
    expect(await storage.getTokens(testProviderId)).toBeUndefined();
  });

  it("should save and load code verifier", async () => {
    const codeVerifier = "test-code-verifier";

    await storage.saveCodeVerifier(testProviderId, codeVerifier);
    const loaded = await storage.getCodeVerifier(testProviderId);

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

    await storage.saveClientInformation(testProviderId, clientInfo);
    await storage.saveTokens(testProviderId, tokens);
    await storage.saveCodeVerifier(testProviderId, codeVerifier);

    // Check that only one file was created
    const files = await fs.readdir(tempDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toBe("test-oauth-test-provider.json");

    // Check file permissions (should be 600)
    const filePath = path.join(tempDir, "test-oauth-test-provider.json");
    const stats = await fs.stat(filePath);
    const mode = stats.mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it("should support multiple providers", async () => {
    const provider1Id = "provider-1";
    const provider2Id = "provider-2";

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

    await storage.saveClientInformation(provider1Id, clientInfo1);
    await storage.saveClientInformation(provider2Id, clientInfo2);

    const loaded1 = await storage.getClientInformation(provider1Id);
    const loaded2 = await storage.getClientInformation(provider2Id);

    expect(loaded1).toEqual(clientInfo1);
    expect(loaded2).toEqual(clientInfo2);
    expect(loaded1).not.toEqual(loaded2);

    // Check that two separate files were created
    const files = await fs.readdir(tempDir);
    expect(files).toHaveLength(2);
    expect(files).toContain("test-oauth-provider-1.json");
    expect(files).toContain("test-oauth-provider-2.json");
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
    await storage.saveClientInformation(testProviderId, clientInfo);

    // Make the file permissions insecure (644 - readable by others)
    const filePath = path.join(tempDir, "test-oauth-test-provider.json");
    await fs.chmod(filePath, 0o644);

    // Create a new storage instance to force reading from disk
    const newStorage = new OnDiskOAuthStorage({
      directory: tempDir,
      filePrefix: "test-oauth",
    });

    // Try to read the file - should fail with permission error
    await expect(
      newStorage.getClientInformation(testProviderId),
    ).rejects.toThrow(AppError);
    await expect(
      newStorage.getClientInformation(testProviderId),
    ).rejects.toMatchObject({
      code: ErrorCode.INSECURE_FILE_PERMISSIONS,
    });
  });

  it("should return undefined for non-existent data", async () => {
    const clientInfo = await storage.getClientInformation(testProviderId);
    const tokens = await storage.getTokens(testProviderId);
    const codeVerifier = await storage.getCodeVerifier(testProviderId);

    expect(clientInfo).toBeUndefined();
    expect(tokens).toBeUndefined();
    expect(codeVerifier).toBeUndefined();
  });
});

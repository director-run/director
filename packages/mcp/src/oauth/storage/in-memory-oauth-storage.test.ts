import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryOAuthStorage } from "./in-memory-oauth-storage";

describe("InMemoryOAuthStorage", () => {
  let storage: InMemoryOAuthStorage;
  const testProviderId = "test-provider";

  beforeEach(() => {
    storage = new InMemoryOAuthStorage();
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
    expect(await storage.getTokens(testProviderId)).toEqual(tokens);

    await storage.deleteTokens(testProviderId);

    const loaded = await storage.getTokens(testProviderId);
    expect(loaded).toBeUndefined();
  });

  it("should save and load code verifier", async () => {
    const codeVerifier = "test-code-verifier";

    await storage.saveCodeVerifier(testProviderId, codeVerifier);
    const loaded = await storage.getCodeVerifier(testProviderId);

    expect(loaded).toBe(codeVerifier);
  });

  it("should return undefined for non-existent data", async () => {
    const clientInfo = await storage.getClientInformation(testProviderId);
    const tokens = await storage.getTokens(testProviderId);
    const codeVerifier = await storage.getCodeVerifier(testProviderId);

    expect(clientInfo).toBeUndefined();
    expect(tokens).toBeUndefined();
    expect(codeVerifier).toBeUndefined();
  });

  it("should support multiple providers with separate data", async () => {
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
  });
});

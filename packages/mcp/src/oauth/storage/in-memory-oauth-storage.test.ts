import {} from "@director.run/utilities/error";
import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryOAuthStorage } from "./in-memory-oauth-storage";

describe("InMemoryOAuthStorage", () => {
  let storage: InMemoryOAuthStorage;

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

    await storage.saveClientInformation(clientInfo);
    const loaded = await storage.getClientInformation();

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

    await storage.saveTokens(tokens);
    const loaded = await storage.getTokens();

    expect(loaded).toEqual(tokens);
  });

  it("should save and load code verifier", async () => {
    const codeVerifier = "test-code-verifier";

    await storage.saveCodeVerifier(codeVerifier);
    const loaded = await storage.getCodeVerifier();

    expect(loaded).toBe(codeVerifier);
  });

  it("should return undefined for non-existent data", async () => {
    const clientInfo = await storage.getClientInformation();
    const tokens = await storage.getTokens();
    const codeVerifier = await storage.getCodeVerifier();

    expect(clientInfo).toBeUndefined();
    expect(tokens).toBeUndefined();
    expect(codeVerifier).toBeUndefined();
  });
});

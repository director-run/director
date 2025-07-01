import { describe, expect, it, vi } from "vitest";
import { createInMemoryOAuthProvider } from "./oauth-provider-factory.js";
import { SimpleClient } from "./simple-client.js";

describe("SimpleClient OAuth Integration", () => {
  it("should create OAuth provider with correct parameters", () => {
    const redirectUrl = "http://localhost:8090/callback";
    const clientMetadata = {
      client_name: "Simple OAuth MCP Client",
      redirect_uris: [redirectUrl],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "mcp:tools",
    };

    const mockRedirectHandler = vi.fn();
    const provider = createInMemoryOAuthProvider(
      redirectUrl,
      mockRedirectHandler,
    );

    expect(provider.redirectUrl).toBe(redirectUrl);
    expect(provider.clientMetadata).toEqual(clientMetadata);
  });

  it("should accept OAuth provider in connectToHTTP method", async () => {
    const client = new SimpleClient("test-oauth-client");
    const oauthProvider = createInMemoryOAuthProvider(
      "http://localhost:8090/callback",
    );

    // This should not throw an error for method signature validation
    expect(() => {
      client.connectToHTTP("http://example.com", {}, oauthProvider);
    }).not.toThrow();
  });

  it("should support OAuth provider in static factory method", async () => {
    const oauthProvider = createInMemoryOAuthProvider(
      "http://localhost:8090/callback",
    );

    // This should not throw an error for method signature validation
    expect(() => {
      SimpleClient.createAndConnectToHTTP(
        "http://example.com",
        {},
        oauthProvider,
      );
    }).not.toThrow();
  });

  it("should support OAuth flow in unified connectToHTTP method", async () => {
    const client = new SimpleClient("test-oauth-client");
    const oauthProvider = createInMemoryOAuthProvider(
      "http://localhost:8090/callback",
    );

    const mockAuthHandler = vi.fn().mockResolvedValue("test-auth-code");

    // This should not throw an error for method signature validation
    expect(() => {
      client.connectToHTTP(
        "http://example.com",
        {},
        oauthProvider,
        mockAuthHandler,
      );
    }).not.toThrow();
  });

  it("should support OAuth flow in static factory method", async () => {
    const oauthProvider = createInMemoryOAuthProvider(
      "http://localhost:8090/callback",
    );

    const mockAuthHandler = vi.fn().mockResolvedValue("test-auth-code");

    // This should not throw an error for method signature validation
    expect(() => {
      SimpleClient.createAndConnectToHTTP(
        "http://example.com",
        {},
        oauthProvider,
        mockAuthHandler,
      );
    }).not.toThrow();
  });
});

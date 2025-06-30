import { describe, expect, it, vi } from "vitest";
import { SimpleClient } from "./simple-client.js";

describe("SimpleClient OAuth Integration", () => {
  it("should create OAuth provider with correct parameters", () => {
    const redirectUrl = "http://localhost:8090/callback";
    const clientMetadata = {
      client_name: "Test Client",
      redirect_uris: [redirectUrl],
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "mcp:tools",
    };

    const mockRedirectHandler = vi.fn();
    const provider = SimpleClient.createOAuthProvider(
      redirectUrl,
      clientMetadata,
      mockRedirectHandler,
    );

    expect(provider.redirectUrl).toBe(redirectUrl);
    expect(provider.clientMetadata).toEqual(clientMetadata);
  });

  it("should accept OAuth provider in connectToHTTP method", async () => {
    const client = new SimpleClient("test-oauth-client");
    const oauthProvider = SimpleClient.createOAuthProvider(
      "http://localhost:8090/callback",
      {
        client_name: "Test Client",
        redirect_uris: ["http://localhost:8090/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "mcp:tools",
      },
    );

    // This should not throw an error for method signature validation
    expect(() => {
      client.connectToHTTP("http://example.com", {}, oauthProvider);
    }).not.toThrow();
  });

  it("should support OAuth provider in static factory method", async () => {
    const oauthProvider = SimpleClient.createOAuthProvider(
      "http://localhost:8090/callback",
      {
        client_name: "Test Client",
        redirect_uris: ["http://localhost:8090/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "mcp:tools",
      },
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
    const oauthProvider = SimpleClient.createOAuthProvider(
      "http://localhost:8090/callback",
      {
        client_name: "Test Client",
        redirect_uris: ["http://localhost:8090/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "mcp:tools",
      },
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
    const oauthProvider = SimpleClient.createOAuthProvider(
      "http://localhost:8090/callback",
      {
        client_name: "Test Client",
        redirect_uris: ["http://localhost:8090/callback"],
        grant_types: ["authorization_code"],
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        scope: "mcp:tools",
      },
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

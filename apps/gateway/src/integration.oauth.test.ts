import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IntegrationTestHarness } from "./test/integration";

/**
 * OAuth consent flow integration tests.
 *
 * These tests verify that the MCP OAuth flow works correctly and that
 * the consent screen is always shown to users before granting access.
 */
describe("OAuth consent flow", () => {
  let harness: IntegrationTestHarness;
  const baseURL = `http://localhost:${IntegrationTestHarness.gatewayPort}`;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("MCP client OAuth", () => {
    it("should require consent for authenticated users", async () => {
      await harness.initializeDatabase();

      // Register and login a user
      const { user } = await harness.register({
        email: "oauth-test@example.com",
        password: "testpassword123",
      });
      expect(user.id).toBeDefined();

      // Get session cookie for authenticated requests
      const loginResponse = await fetch(`${baseURL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "oauth-test@example.com",
          password: "testpassword123",
        }),
      });
      const sessionCookie = loginResponse.headers.get("set-cookie") || "";

      // Step 1: Dynamic client registration (simulating an MCP client like Cursor)
      const registerResponse = await fetch(`${baseURL}/api/auth/mcp/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirect_uris: ["http://localhost:9999/callback"],
          client_name: "Test MCP Client",
          token_endpoint_auth_method: "client_secret_post",
          grant_types: ["authorization_code", "refresh_token"],
        }),
      });

      expect(registerResponse.ok).toBe(true);
      const clientData = await registerResponse.json();
      expect(clientData.client_id).toBeDefined();
      expect(clientData.client_secret).toBeDefined();

      // Step 2: Initiate authorization flow as authenticated user
      const codeVerifier = "test-code-verifier-that-is-long-enough-for-pkce";
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      const authParams = new URLSearchParams({
        response_type: "code",
        client_id: clientData.client_id,
        redirect_uri: "http://localhost:9999/callback",
        scope: "openid profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: "test-state-123",
      });

      // Make authorization request with session cookie (authenticated user)
      const authResponse = await fetch(
        `${baseURL}/api/auth/mcp/authorize?${authParams}`,
        {
          method: "GET",
          headers: { Cookie: sessionCookie },
          redirect: "manual",
        },
      );

      // Should redirect (either to consent page or to add prompt=consent)
      expect(authResponse.status).toBe(302);
      const redirectLocation = authResponse.headers.get("location") || "";

      // The flow should redirect to consent - either directly to /connect
      // or back to authorize with prompt=consent (which then redirects to /connect)
      // Key assertion: user should NOT be redirected directly to callback
      expect(redirectLocation).not.toContain("localhost:9999/callback");

      // If redirecting back to authorize, it should include prompt=consent
      if (redirectLocation.includes("/api/auth/mcp/authorize")) {
        expect(redirectLocation).toContain("prompt=consent");

        // Follow this redirect to verify it goes to consent page
        const consentResponse = await fetch(
          redirectLocation.startsWith("http")
            ? redirectLocation
            : `${baseURL}${redirectLocation}`,
          {
            method: "GET",
            headers: { Cookie: sessionCookie },
            redirect: "manual",
          },
        );

        expect(consentResponse.status).toBe(302);
        const finalLocation = consentResponse.headers.get("location") || "";
        expect(finalLocation).toContain("/connect");
        expect(finalLocation).toContain("consent_code");
      } else {
        // Direct redirect to consent page
        expect(redirectLocation).toContain("/connect");
      }
    });

    it("should redirect unauthenticated users to login page", async () => {
      await harness.initializeDatabase();

      // Register a client first
      const registerResponse = await fetch(`${baseURL}/api/auth/mcp/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirect_uris: ["http://localhost:9999/callback"],
          client_name: "Test Client 2",
          token_endpoint_auth_method: "client_secret_post",
          grant_types: ["authorization_code", "refresh_token"],
        }),
      });

      const clientData = await registerResponse.json();

      // Initiate authorization WITHOUT session cookie (unauthenticated)
      const codeVerifier = "another-code-verifier-that-is-long-enough";
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      const authParams = new URLSearchParams({
        response_type: "code",
        client_id: clientData.client_id,
        redirect_uri: "http://localhost:9999/callback",
        scope: "openid profile",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: "test-state-456",
      });

      // Make authorization request without session
      const authResponse = await fetch(
        `${baseURL}/api/auth/mcp/authorize?${authParams}`,
        {
          method: "GET",
          redirect: "manual",
        },
      );

      // Should redirect to login page
      expect(authResponse.status).toBe(302);
      const redirectLocation = authResponse.headers.get("location") || "";

      // Should NOT redirect directly to callback (no auth code without login)
      expect(redirectLocation).not.toContain("localhost:9999/callback");

      // Should eventually redirect to /connect (login/consent page)
      // The redirect might include prompt=consent first
      if (redirectLocation.includes("/api/auth/mcp/authorize")) {
        const nextResponse = await fetch(
          redirectLocation.startsWith("http")
            ? redirectLocation
            : `${baseURL}${redirectLocation}`,
          {
            method: "GET",
            redirect: "manual",
          },
        );
        const finalLocation = nextResponse.headers.get("location") || "";
        expect(finalLocation).toContain("/connect");
      } else {
        expect(redirectLocation).toContain("/connect");
      }
    });
  });
});

/**
 * Generate PKCE code challenge from verifier using SHA-256.
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  // Convert to base64url
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

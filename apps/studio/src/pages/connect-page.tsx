import { ConnectPage as ConnectPageComponent } from "@director.run/design/components/pages/auth/connect.tsx";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GATEWAY_URL } from "../config";
import { useAuth } from "../contexts/auth-context.tsx";

/**
 * OAuth connection page for MCP clients.
 *
 * This page is the `loginPage` configured in better-auth's MCP plugin.
 * When an MCP client initiates OAuth, better-auth redirects here.
 *
 * Flow:
 * 1. MCP client requests authorization at /api/auth/mcp/authorize
 * 2. better-auth stores OAuth params in session and redirects here
 * 3. User logs in (if not authenticated)
 * 4. After login, user approves the authorization
 * 5. We redirect back to the authorize endpoint to complete the flow
 */
export function ConnectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams] = useSearchParams();

  const { login, isAuthenticated, isInitializing } = useAuth();

  // Extract OAuth params from URL (these are passed by better-auth)
  const clientId = searchParams.get("client_id");
  const scope = searchParams.get("scope") || "";
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const responseType = searchParams.get("response_type");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  // Parse scopes from space-separated string
  const scopes = scope
    ? scope.split(" ").filter((s: string) => s.length > 0)
    : ["mcp:tools", "mcp:resources", "mcp:prompts"];

  // Get client name from client_id (or use a default)
  const clientName = clientId || "MCP Client";

  // Handle login form submission
  const handleLogin = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        setError(null);
        setIsLoading(true);
        await login(credentials);
        // After login, the OAuth flow will continue
        // We stay on this page to show the approval UI
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  // Handle approval - redirect back to authorize endpoint
  const handleApprove = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      // Reconstruct the authorization URL with all params
      const authorizeUrl = new URL(`${GATEWAY_URL}/api/auth/mcp/authorize`);

      // Add all the OAuth params
      if (clientId) {
        authorizeUrl.searchParams.set("client_id", clientId);
      }
      if (redirectUri) {
        authorizeUrl.searchParams.set("redirect_uri", redirectUri);
      }
      if (responseType) {
        authorizeUrl.searchParams.set("response_type", responseType);
      }
      if (scope) {
        authorizeUrl.searchParams.set("scope", scope);
      }
      if (state) {
        authorizeUrl.searchParams.set("state", state);
      }
      if (codeChallenge) {
        authorizeUrl.searchParams.set("code_challenge", codeChallenge);
      }
      if (codeChallengeMethod) {
        authorizeUrl.searchParams.set(
          "code_challenge_method",
          codeChallengeMethod,
        );
      }

      // Redirect to the authorize endpoint to complete the flow
      window.location.href = authorizeUrl.toString();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [
    clientId,
    redirectUri,
    responseType,
    scope,
    state,
    codeChallenge,
    codeChallengeMethod,
  ]);

  // Handle denial - redirect back with error
  const handleDeny = useCallback(() => {
    if (redirectUri) {
      const denyUrl = new URL(redirectUri);
      denyUrl.searchParams.set("error", "access_denied");
      denyUrl.searchParams.set(
        "error_description",
        "User denied the authorization request",
      );
      if (state) {
        denyUrl.searchParams.set("state", state);
      }
      window.location.href = denyUrl.toString();
    } else {
      // No redirect URI, just go home
      window.location.href = "/";
    }
  }, [redirectUri, state]);

  // Auto-approve if user is already authenticated and this is a callback
  // (This provides a smoother UX for returning users)
  useEffect(() => {
    // If user is authenticated and we have OAuth params, auto-approve after a brief delay
    // This gives the user a moment to see what's happening
    if (isAuthenticated && !isInitializing && clientId) {
      // Show the approval UI briefly before auto-approving
      // User can still click Deny if they want
    }
  }, [isAuthenticated, isInitializing, clientId]);

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-fg-subtle">Loading...</div>
      </div>
    );
  }

  return (
    <ConnectPageComponent
      error={error}
      isLoading={isLoading}
      isAuthenticated={isAuthenticated}
      clientName={clientName}
      scopes={scopes}
      onApprove={handleApprove}
      onDeny={handleDeny}
      defaultValues={{ email: "", password: "" }}
      onLogin={handleLogin}
      signupLink={
        <Link to="/signup" className="text-fg underline hover:no-underline">
          Sign up
        </Link>
      }
    />
  );
}

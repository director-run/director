import { ConnectPage as ConnectPageComponent } from "@director.run/design/components/pages/auth/connect.tsx";
import { useCallback, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  DANGEROUSLY_PREFILL_LOGIN_EMAIL,
  DANGEROUSLY_PREFILL_LOGIN_PASSWORD,
} from "../config.ts";
import { useAuth } from "../contexts/auth-context.tsx";
import { gatewayClient } from "../contexts/backend-context.tsx";
import { authClient } from "../lib/auth-client.ts";
/**
 * OAuth consent page for MCP clients.
 *
 * This page serves as BOTH the `loginPage` AND `consentPage` for better-auth's
 * MCP plugin. When an MCP client initiates OAuth, better-auth redirects here.
 *
 * Two flows:
 * 1. NOT AUTHENTICATED: Shows login form. After login, better-auth continues
 *    the OAuth flow automatically via the oidc_login_prompt cookie.
 * 2. AUTHENTICATED: Shows consent UI with approve/deny buttons.
 *    User approves → better-auth returns redirect URL with auth code.
 */
export function ConnectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isInitializing } = useAuth();

  // Consent flow params (provided by better-auth when user is authenticated)
  const consentCode = searchParams.get("consent_code");
  const clientId = searchParams.get("client_id");
  const scope = searchParams.get("scope") || "";

  // Fetch consent info to get redirect_uri (not in URL params for security)
  const consentInfoQuery = gatewayClient.auth.getConsentInfo.useQuery(
    { consentCode: consentCode || "" },
    { enabled: isAuthenticated && Boolean(consentCode) },
  );

  // Parse scopes for display
  const scopes = scope
    ? scope.split(" ").filter((s: string) => s.length > 0)
    : ["mcp:tools", "mcp:resources", "mcp:prompts"];

  // Use friendly name from OAuth application, fall back to client_id, then generic
  const clientName =
    consentInfoQuery.data?.clientName || clientId || "MCP Client";

  // Handle login - after success, better-auth continues OAuth flow automatically
  const handleLogin = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        setError(null);
        setIsLoading(true);
        await login(credentials);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  // Handle consent approval
  const handleApprove = useCallback(async () => {
    if (!consentCode) {
      setError(new Error("Missing consent code"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.oauth2.consent({
        accept: true,
        consent_code: consentCode,
      });

      if (result.error) {
        throw new Error(result.error.message || "Consent failed");
      }

      if (result.data?.redirectURI) {
        window.location.href = result.data.redirectURI;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [consentCode]);

  // Handle consent denial
  const handleDeny = useCallback(async () => {
    if (!consentCode) {
      window.location.href = "/";
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.oauth2.consent({
        accept: false,
        consent_code: consentCode,
      });

      if (result.data?.redirectURI) {
        window.location.href = result.data.redirectURI;
      } else {
        window.location.href = "/";
      }
    } catch {
      window.location.href = "/";
    }
  }, [consentCode]);

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
      redirectUri={consentInfoQuery.data?.redirectUri || null}
      onApprove={handleApprove}
      onDeny={handleDeny}
      defaultValues={{
        email: DANGEROUSLY_PREFILL_LOGIN_EMAIL || "",
        password: DANGEROUSLY_PREFILL_LOGIN_PASSWORD || "",
      }}
      onLogin={handleLogin}
      signupLink={
        <Link to="/signup" className="text-fg underline hover:no-underline">
          Sign up
        </Link>
      }
    />
  );
}

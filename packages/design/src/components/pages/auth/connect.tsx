import type { ReactNode } from "react";
import { LoginForm } from "../../forms/login-form.tsx";
import { Button } from "../../ui/button.tsx";
import { Container } from "../../ui/container.tsx";
import { Logo } from "../../ui/icons/logo.tsx";
import { Section, SectionHeader } from "../../ui/section.tsx";
import { SectionDescription, SectionTitle } from "../../ui/section.tsx";

/**
 * OAuth connection/approval page for MCP clients.
 * Shows login form if not authenticated, otherwise shows approval UI.
 */
export function ConnectPage(props: Props) {
  const {
    error,
    isLoading,
    isAuthenticated,
    clientName,
    scopes,
    redirectUri,
    onApprove,
    onDeny,
    // Login props
    defaultValues,
    onLogin,
    signupLink,
  } = props;

  return (
    <div className="flex min-h-dvh w-full items-center justify-center">
      <Container size="sm" className="w-full py-12 lg:py-16">
        <Section className="gap-y-8">
          <Logo className="mx-auto" />

          {isAuthenticated ? (
            // Approval UI when authenticated
            <>
              <SectionHeader className="items-center gap-y-1.5 text-center">
                <SectionTitle className="font-medium text-2xl">
                  Authorize Application
                </SectionTitle>
                <SectionDescription className="text-base">
                  <span className="font-medium text-fg">{clientName}</span>{" "}
                  wants to access your Director playbooks
                </SectionDescription>
              </SectionHeader>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
                  {error.message}
                </div>
              )}

              <div className="rounded-xl bg-accent-subtle p-4 shadow-[0_0_0_0.5px_rgba(55,50,46,0.15)]">
                <p className="mb-3 font-medium text-fg text-sm">
                  This will allow the application to:
                </p>
                <ul className="space-y-2">
                  {scopes.map((scope) => (
                    <li
                      key={scope}
                      className="flex items-center gap-2 text-fg-subtle text-sm"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                        <CheckIcon />
                      </span>
                      {formatScope(scope)}
                    </li>
                  ))}
                </ul>
              </div>

              {redirectUri && (
                <div className="rounded-lg border border-accent bg-accent-subtle/50 p-3">
                  <p className="mb-1 font-medium text-fg text-xs">
                    After approval, you will be redirected to:
                  </p>
                  <p className="break-all font-mono text-fg-subtle text-xs">
                    {redirectUri}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onDeny}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Deny
                </Button>
                <Button
                  onClick={onApprove}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Authorizing..." : "Approve"}
                </Button>
              </div>
            </>
          ) : (
            // Login form when not authenticated
            <>
              <SectionHeader className="items-center gap-y-1.5 text-center">
                <SectionTitle className="font-medium text-2xl">
                  Sign in to Continue
                </SectionTitle>
                <SectionDescription className="text-base">
                  {clientName ? (
                    <>
                      <span className="font-medium text-fg">{clientName}</span>{" "}
                      wants to connect to Director
                    </>
                  ) : (
                    "Please log in to authorize this application"
                  )}
                </SectionDescription>
              </SectionHeader>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
                  {error.message}
                </div>
              )}

              <LoginForm
                defaultValues={defaultValues}
                onSubmit={onLogin}
                isSubmitting={isLoading}
              />

              {signupLink && (
                <p className="text-center text-fg-subtle text-sm">
                  Don't have an account? {signupLink}
                </p>
              )}
            </>
          )}
        </Section>
      </Container>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatScope(scope: string): string {
  // Format scope strings into human-readable descriptions
  const scopeDescriptions: Record<string, string> = {
    "mcp:tools": "Access and use tools from your playbooks",
    "mcp:resources": "Read resources from your playbooks",
    "mcp:prompts": "Access prompts from your playbooks",
    openid: "Verify your identity",
    profile: "Access your profile information",
    email: "Access your email address",
    offline_access: "Maintain access when you're not using the app",
  };
  return scopeDescriptions[scope] || scope;
}

type Props = {
  error: Error | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  clientName: string | null;
  scopes: string[];
  redirectUri: string | null;
  onApprove: () => void;
  onDeny: () => void;
  // Login props (used when not authenticated)
  defaultValues: {
    email: string;
    password: string;
  };
  onLogin: (user: { email: string; password: string }) => Promise<void> | void;
  signupLink?: ReactNode;
};

import { ConnectPage } from "@director.run/design/components/pages/auth/connect.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const scopes = ["mcp:tools", "mcp:prompts", "openid", "profile"];
const redirectUri = "https://claude.ai/api/mcp/auth_callback";

/**
 * The OAuth connect/consent page. Only its sub-components have stories today;
 * these cover the full page across the login, consent, loading and error
 * states.
 */
const meta = {
  title: "kitchen-sink/pages/connect",
  component: ConnectPage,
  parameters: { layout: "fullscreen" },
  args: {
    error: null,
    isLoading: false,
    isAuthenticated: false,
    clientName: "Claude Desktop",
    scopes: [],
    redirectUri: null,
    onApprove: () => {},
    onDeny: () => {},
    defaultValues: { email: "", password: "" },
    onLogin: async () => {},
    signupLink: <a href="/signup">Sign up</a>,
  },
} satisfies Meta<typeof ConnectPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

export const Consent: Story = {
  args: { isAuthenticated: true, scopes, redirectUri },
};

export const Loading: Story = {
  args: { isAuthenticated: true, isLoading: true, scopes, redirectUri },
};

export const Error: Story = {
  args: {
    isAuthenticated: true,
    scopes,
    redirectUri,
    error: { message: "Authorization failed. Please try again." } as Error,
  },
};

export const ConsentDarkMode: Story = {
  args: { isAuthenticated: true, scopes, redirectUri },
  globals: { darkMode: true },
};

import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import type { RegistryRouterOutputs } from "@director.run/registry/client";

// Registry
export type RegistryEntryList =
  RegistryRouterOutputs["entries"]["getEntries"]["entries"];

export type RegistryEntryDetail =
  RegistryRouterOutputs["entries"]["getEntryByName"];

// Workspace
export type WorkspaceList = GatewayRouterOutputs["store"]["getAll"];
export type WorkspaceDetail = GatewayRouterOutputs["store"]["get"];
export type WorkspaceTarget =
  GatewayRouterOutputs["store"]["get"]["servers"][number];

// Client
export interface Client {
  id: string;
  label: string;
  image: string;
  installed?: boolean; // whether the client app is available on the system
  present?: boolean; // whether the proxy is currently installed in that client
}

// MCP
// export type MCPTool = NonNullable<RegistryEntryDetail["tools"]>[number];
export type MCPTool = GatewayRouterOutputs["tools"]["list"][number];

export type ClientNames = "claude" | "cursor" | "vscode" | "claude-code";

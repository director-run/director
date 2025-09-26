import type { GatewayRouterOutputs } from "@director.run/gateway/client";

// Registry
export type RegistryEntryList =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"];

export type RegistryEntryDetail =
  GatewayRouterOutputs["registry"]["getEntryByName"];

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
  type: "installer" | "deep-link";
  // For installer-type clients only
  installed?: boolean; // whether the client app is available on the system
  present?: boolean; // whether the proxy is currently installed in that client
}

// MCP
export type MCPTool = NonNullable<RegistryEntryDetail["tools"]>[number];

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

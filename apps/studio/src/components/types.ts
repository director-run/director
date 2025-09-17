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
  GatewayRouterOutputs["store"]["get"]["targets"][number];

// MCP
export type MCPTool = NonNullable<RegistryEntryDetail["tools"]>[number];

// Trash
export type DeprecatedRegistryEntryListItem =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"][number]; // TODO: Remove this type
export type DeprecatedWorkspaceTargetTransport = WorkspaceTarget["transport"];

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

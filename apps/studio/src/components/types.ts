import type { GatewayRouterOutputs } from "@director.run/gateway/client";

// Registry
export type MasterRegistryEntryList =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"];
export type MasterRegistryEntryListItem =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"][number];
export type MasterRegistryEntryDetail =
  GatewayRouterOutputs["registry"]["getEntryByName"];

// Workspace
export type MasterWorkspaceList = GatewayRouterOutputs["store"]["getAll"];
export type MasterWorkspace = GatewayRouterOutputs["store"]["get"];
export type MasterWorkspaceTarget =
  GatewayRouterOutputs["store"]["get"]["targets"][number];

// MCP
export type MasterMCPTool = NonNullable<
  MasterRegistryEntryDetail["tools"]
>[number];

// Trash
export type StoreServerTransport = MasterWorkspaceTarget["transport"];
export type RegistryGetEntriesEntry = MasterRegistryEntryListItem;

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

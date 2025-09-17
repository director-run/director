import type { GatewayRouterOutputs } from "@director.run/gateway/client";

// Registry
export type MasterRegistryEntryList =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"];
export type MasterRegistryEntry =
  GatewayRouterOutputs["registry"]["getEntryByName"];

// Workspace
export type MasterWorkspaceList = GatewayRouterOutputs["store"]["getAll"];
export type MasterWorkspace = GatewayRouterOutputs["store"]["get"];
export type MasterWorkspaceTarget = MasterWorkspace["targets"][number];

// MCP
export type MasterMCPTool = NonNullable<MasterRegistryEntry["tools"]>[number];

// Trash
export type StoreServer = MasterWorkspaceTarget;
export type StoreServerTransport = MasterWorkspaceTarget["transport"];

export type RegistryGetEntries = GatewayRouterOutputs["registry"]["getEntries"];

export type RegistryGetEntriesEntry = RegistryGetEntries["entries"][number];

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

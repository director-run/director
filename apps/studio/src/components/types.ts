import type { GatewayRouterOutputs } from "@director.run/gateway/client";

// Registry
export type MasterRegistryEntry =
  GatewayRouterOutputs["registry"]["getEntryByName"];

export type MasterRegistryEntryList =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"];

// Workspace
export type MasterWorkspaceList = GatewayRouterOutputs["store"]["getAll"];
export type MasterWorkspace = GatewayRouterOutputs["store"]["get"];
export type MasterWorkspaceTarget = MasterWorkspace["targets"][number];

// MCP
export type MasterMCPTool = NonNullable<MasterRegistryEntry["tools"]>[number];

// Trash
export type StoreServer = MasterWorkspace["servers"][number];
export type StoreServerTransport = StoreServer["transport"];
export type RegistryGetEntries = GatewayRouterOutputs["registry"]["getEntries"];

export type RegistryGetEntriesEntry = RegistryGetEntries["entries"][number];

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

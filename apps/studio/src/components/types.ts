import type { GatewayRouterOutputs } from "@director.run/gateway/client";

// Registry
export type MasterRegistryEntryList =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"];
export type MasterRegistryEntry =
  GatewayRouterOutputs["registry"]["getEntryByName"];

// Workspace
export type MasterWorkspaceList = GatewayRouterOutputs["store"]["getAll"];
export type MasterWorkspace = GatewayRouterOutputs["store"]["get"];
export type MasterWorkspaceTarget =
  GatewayRouterOutputs["store"]["get"]["targets"][number];

// MCP
export type MasterMCPTool = NonNullable<MasterRegistryEntry["tools"]>[number];

// Trash
export type StoreServerTransport = MasterWorkspaceTarget["transport"];
export type RegistryGetEntriesEntry = MasterRegistryEntryList[number];

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

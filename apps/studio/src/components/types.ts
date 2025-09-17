import type { GatewayRouterOutputs } from "@director.run/gateway/client";

export type RegistryGetEntries = GatewayRouterOutputs["registry"]["getEntries"];

export type RegistryGetEntriesEntry = RegistryGetEntries["entries"][number];

export type MasterRegistryEntry =
  GatewayRouterOutputs["registry"]["getEntryByName"];

export type MasterRegistryEntryList =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"];

export type MasterWorkspace = GatewayRouterOutputs["store"]["get"];

export type MasterWorkspaceTarget = MasterWorkspace["targets"][number];

export type MasterMCPTool = NonNullable<MasterRegistryEntry["tools"]>[number];

export type StoreGetAll = GatewayRouterOutputs["store"]["getAll"];

export type StoreGet = MasterWorkspace;

export type StoreServer = StoreGet["servers"][number];

export type StoreServerTransport = StoreServer["transport"];

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

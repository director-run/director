import type { GatewayRouterOutputs } from "@director.run/gateway/client";

export type RegistryGetEntries = GatewayRouterOutputs["registry"]["getEntries"];

export type RegistryGetEntriesEntry = RegistryGetEntries["entries"][number];

export type MasterRegistryEntry =
  GatewayRouterOutputs["registry"]["getEntryByName"];

export type MasterRegistryEntryList =
  GatewayRouterOutputs["registry"]["getEntries"]["entries"];

export type RegistryGetEntryTools = MasterRegistryEntry["tools"];

export type RegistryGetEntryTool = NonNullable<RegistryGetEntryTools>[number];

export type StoreGetAll = GatewayRouterOutputs["store"]["getAll"];

export type StoreGet = GatewayRouterOutputs["store"]["get"];

export type StoreServer = StoreGet["servers"][number];

export type StoreServerTransport = StoreServer["transport"];

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

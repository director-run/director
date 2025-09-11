import { GatewayRouterOutputs } from "@director.run/gateway/client";

export type RegistryGetEntries = GatewayRouterOutputs["registry"]["getEntries"];

export type RegistryGetEntriesEntry = RegistryGetEntries["entries"][number];

export type RegistryGetEntryByName =
  GatewayRouterOutputs["registry"]["getEntryByName"];

export type RegistryGetEntryTools = RegistryGetEntryByName["tools"];

export type RegistryGetEntryTool = NonNullable<RegistryGetEntryTools>[number];

export type StoreGetAll = GatewayRouterOutputs["store"]["getAll"];

export type StoreGet = GatewayRouterOutputs["store"]["get"];

export type StoreServer = StoreGet["servers"][number];

export type StoreServerTransport = StoreServer["transport"];

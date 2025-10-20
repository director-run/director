import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import type { RegistryRouterOutputs } from "@director.run/registry/client";

export type RegistryEntryList =
  RegistryRouterOutputs["entries"]["getEntries"]["entries"];

export type RegistryEntryDetail =
  RegistryRouterOutputs["entries"]["getEntryByName"];

export type PlaybookList = GatewayRouterOutputs["store"]["getAll"];
export type PlaybookDetail = GatewayRouterOutputs["store"]["get"];
export type PlaybookTarget =
  GatewayRouterOutputs["store"]["get"]["servers"][number];

export interface Client {
  id: string;
  label: string;
  image: string;
  installed?: boolean; // whether the client app is available on the system
  present?: boolean; // whether the playbook is currently installed in that client
}

export type MCPTool = GatewayRouterOutputs["tools"]["list"][number];

export type ClientNames = "claude" | "cursor" | "vscode" | "claude-code";

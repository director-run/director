import { createGatewayClient } from "@director.run/gateway/client";
import { createRegistryClient } from "@director.run/registry/client";
import { config, getGatewayUrl } from "./env";

export const gatewayClient = createGatewayClient(getGatewayUrl());
export const registryClient = createRegistryClient(
  config.get("registry.url") as string,
  {
    apiKey: config.get("registry.apiKey"),
  },
);

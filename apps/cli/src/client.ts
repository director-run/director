import { createGatewayClient } from "@director.run/gateway/client";
import { createRegistryClient } from "@director.run/registry/client";
import { REGISTRY_API_KEY, REGISTRY_URL, getGatewayBaseUrl } from "./config";

export const gatewayClient = createGatewayClient(getGatewayBaseUrl());
export const registryClient = createRegistryClient(REGISTRY_URL, {
  apiKey: REGISTRY_API_KEY,
});

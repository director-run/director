import { createGatewayClient } from "@director.run/gateway/client";
import { createRegistryClient } from "@director.run/registry/client";
import { env, getGatewayUrl } from "./env";

export const gatewayClient = createGatewayClient(getGatewayUrl());
export const registryClient = createRegistryClient(env.REGISTRY_API_URL, {
  apiKey: env.REGISTRY_API_KEY,
});

import { createGatewayClient } from "@director.run/gateway/client";
import { createRegistryClient } from "@director.run/registry/client";
import { env } from "./env";

export const gatewayClient = createGatewayClient(env.GATEWAY_URL);
export const registryClient = createRegistryClient(env.REGISTRY_API_URL, {
  apiKey: env.REGISTRY_API_KEY,
});

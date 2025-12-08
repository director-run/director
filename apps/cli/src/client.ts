import { createGatewayClient } from "@director.run/gateway/client";
import { createRegistryClient } from "@director.run/registry/client";
import { env } from "./env";
import { getAuthToken } from "./utils/auth";

export const gatewayClient = createGatewayClient(env.GATEWAY_URL, {
  getAuthToken,
});
export const registryClient = createRegistryClient(env.REGISTRY_URL, {
  apiKey: env.REGISTRY_API_KEY,
});

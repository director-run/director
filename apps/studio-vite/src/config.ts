const appConfig = (window as any).__APP_CONFIG__;

export const GATEWAY_URL = appConfig?.gatewayUrl || "http://localhost:3673";
export const REGISTRY_URL =
  appConfig?.registryUrl || "https://registry.director.run";
export const BASE_PATH = appConfig?.basePath || "/";

console.log("config is", { GATEWAY_URL, REGISTRY_URL, BASE_PATH });

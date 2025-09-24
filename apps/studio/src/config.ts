const appConfig = (
  window as unknown as { __APP_CONFIG__: Record<string, string> | undefined }
).__APP_CONFIG__;

export const GATEWAY_URL: string =
  appConfig?.gatewayUrl || "http://localhost:3673";
export const REGISTRY_URL: string =
  appConfig?.registryUrl || "https://registry.director.run";
export const BASE_PATH: string = appConfig?.basePath || "/";

console.log("config is", { GATEWAY_URL, REGISTRY_URL, BASE_PATH });

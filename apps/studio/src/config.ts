const appConfig = (
  window as unknown as { __APP_CONFIG__: Record<string, string> | undefined }
).__APP_CONFIG__;

export const GATEWAY_URL: string =
  appConfig?.gatewayUrl || "http://localhost:3600";
export const REGISTRY_URL: string =
  appConfig?.registryUrl || "https://registry.director.run";
export const BASE_PATH: string = appConfig?.basePath || "/";
export const DANGEROUSLY_PREFILL_LOGIN_EMAIL: string | undefined =
  process.env.NODE_ENV === "development" ? "user@director.run" : "";
export const DANGEROUSLY_PREFILL_LOGIN_PASSWORD: string | undefined =
  process.env.NODE_ENV === "development" ? "password" : "";

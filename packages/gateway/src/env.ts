import { isTest } from "@director.run/utilities/env";

export const DEBUG = false;
export const SERVER_PORT = isTest() ? 4673 : 3673;
export const REGISTRY_URL = "https://registry.director.run";
export const REGISTRY_API_KEY = "";
export const TELEMETRY_WRITE_KEY = "";
export const TELEMETRY_ENABLED = false;
export const OAUTH_STORAGE = "disk";
export const OAUTH_TOKEN_DIRECTORY = "./tokens";

// const SEGMENT_PRODUCTION_WRITE_KEY = "Z8wjEfWMFnlltCpGPPWlvsEQH1aVEUH3";

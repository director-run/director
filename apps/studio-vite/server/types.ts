export interface AppConfig {
  appName: string;
  apiUrl: string;
  environment: string;
  version: string;
}

export interface SPAMiddlewareOptions {
  distPath: string;
  indexFile?: string;
  configInjector?: (config: AppConfig) => string;
}

declare global {
  // biome-ignore lint/style/noNamespace: <explanation>
  namespace Express {
    interface Request {
      appConfig?: AppConfig;
    }
  }
}

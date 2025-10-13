import { Config } from "../config";

export function makeTestConfig(): Promise<Config> {
  return Config.createMemoryBasedConfig({
    defaults: {
      registry: {
        url: "https://registry.director.run",
      },
      server: {
        port: 4673,
      },
      telemetry: {
        writeKey: "test-write-key",
        enabled: false,
      },
      oauth: {
        storage: "memory",
      },
    },
  });
}

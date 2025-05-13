import { ProxyServerStore } from "../services/proxy/proxy-server-store";
import { startService } from "../server";
import { createGatewayClient } from "../trpc/client";

export type IntegrationTestVariables = {
  trpcClient: ReturnType<typeof createGatewayClient>;
  close: () => Promise<void>;
  proxyStore: ProxyServerStore;
  port: number;
};

export const setupIntegrationTest =
  async (): Promise<IntegrationTestVariables> => {
    const proxyStore = await ProxyServerStore.create();
    const port = 3673;
    const directorService = await startService({ proxyStore, port });

    const close = async () => {
      await proxyStore.purge();
      await new Promise<void>((resolve) => {
        directorService.close(() => resolve());
      });
    };

    return {
      trpcClient: createGatewayClient(`http://localhost:${port}/trpc`),
      close,
      proxyStore,
      port,
    };
  };

export const makeSSETargetConfig = (params: { name: string; url: string }) => ({
  name: params.name,
  transport: {
    type: "sse" as const,
    url: params.url,
  },
});

export const makeStdioTargetConfig = (params: {
  name: string;
  command: string;
  args: string[];
}) => ({
  name: params.name,
  transport: {
    type: "stdio" as const,
    command: params.command,
    args: params.args,
  },
});

export function makeFooBarServerStdioConfig() {
  return makeStdioTargetConfig({
    name: "Foo",
    command: "bun",
    args: [
      "-e",
      `
      import { makeFooBarServer } from "@director.run/mcp/test/fixtures";
      import { serveOverStdio } from "@director.run/mcp/transport";
      serveOverStdio(makeFooBarServer());
    `,
    ],
  });
}


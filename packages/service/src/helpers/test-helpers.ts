import { ProxyServerStore } from "../services/proxy/proxy-server-store";
import { startService } from "../start-service";
import { trpc } from "../trpc/client";

export type IntegrationTestVariables = {
  trpcClient: typeof trpc;
  close: () => Promise<void>;
  proxyStore: ProxyServerStore;
};

export const setupIntegrationTest =
  async (): Promise<IntegrationTestVariables> => {
    const proxyStore = await ProxyServerStore.create();
    const directorService = await startService({ proxyStore });

    const close = async () => {
      await proxyStore.purge();
      await new Promise<void>((resolve) => {
        directorService.close(() => resolve());
      });
    };

    return { trpcClient: trpc, close, proxyStore };
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

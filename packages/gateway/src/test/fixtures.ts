import { startService, Gateway } from "../server";
import { createGatewayClient } from "../trpc/client";
import path from "node:path";

export type IntegrationTestVariables = {
  client: ReturnType<typeof createGatewayClient>;
  close: () => Promise<void>;
  gateway: Gateway;
};

export const setupIntegrationTest =
  async (): Promise<IntegrationTestVariables> => {
    const gateway = await startService({
      port: 3673,
      databaseFilePath: path.join(__dirname, "db.test.json"),
    });

    const close = async () => {
      await gateway.proxyStore.purge();
      await gateway.stop();
    };

    return {
      client: createGatewayClient(`http://localhost:${gateway.port}/trpc`),
      close,
      gateway,
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


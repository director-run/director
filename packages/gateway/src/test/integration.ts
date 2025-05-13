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
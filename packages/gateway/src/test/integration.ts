import { startService, Gateway } from "../server";
import { createGatewayClient } from "../trpc/client";
import path from "node:path";

export class IntegrationTestHarness {
    public readonly gateway: Gateway;
    public readonly client: ReturnType<typeof createGatewayClient>;

    private constructor(params: {
        gateway: Gateway;
        client: ReturnType<typeof createGatewayClient>;
    }) {
        this.gateway = params.gateway;
        this.client = params.client;
    }

    public async purge() {
        await this.gateway.proxyStore.purge();
    }

    public static async start() {
        const gateway = await startService({
            port: 3673,
            databaseFilePath: path.join(__dirname, "db.test.json"),
        });

        const client = createGatewayClient(`http://localhost:${gateway.port}`);

        return new IntegrationTestHarness({
            gateway,
            client,
        });
    }


    public async stop() {
        await this.gateway.proxyStore.purge();
        await this.gateway.stop();
    }
}
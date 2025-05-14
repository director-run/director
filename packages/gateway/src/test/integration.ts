import { Gateway } from "../server";
import { createGatewayClient } from "../client";
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
        const gateway = await Gateway.start({
            port: 4673,
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
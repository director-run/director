import { Gateway } from "../gateway";
import { createGatewayClient } from "../client";
import path from "node:path";


export class IntegrationTestHarness {
    public readonly gateway: Gateway;
    public readonly client: ReturnType<typeof createGatewayClient>;
    public static gatewayPort: number = 4673;

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

    public get database() {
        return this.gateway.db;
    }

    public static async start() {
        const gateway = await Gateway.start({
            port: IntegrationTestHarness.gatewayPort,
            databaseFilePath: path.join(__dirname, "config.test.json"),
            registryURL: "http://localhost:3000",
            oauth: {
                enabled: true,
                storage: "memory",
            },
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
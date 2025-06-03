import { Gateway } from "../gateway";
import { createGatewayClient } from "../client";
import path from "node:path";

const TEST_PORT = 4673;

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
            port: TEST_PORT,
            databaseFilePath: path.join(__dirname, "config.test.json"),
            registryURL: "http://localhost:3000",
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
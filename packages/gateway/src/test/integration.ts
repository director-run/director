import { Gateway } from "../gateway";
import { createGatewayClient } from "../client";
import path from "node:path";
import type { Server } from "node:http";
import { makeEchoServer, makeFooBarServer, makeHTTPTargetConfig, makeKitchenSinkServer } from "@director.run/mcp/test/fixtures";
import { serveOverSSE, serveOverStreamable } from "@director.run/mcp/transport";
import type { ProxyTargetAttributes } from "@director.run/utilities/schema";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

const PROXY_TARGET_PORT = 4521;

export class IntegrationTestHarness {
    public readonly gateway: Gateway;
    public readonly client: ReturnType<typeof createGatewayClient>;
    public static gatewayPort: number = 4673;

    private echoServerSSEInstance: Server;
    private kitchenSinkServerInstance: Server;
    private fooBarServerInstance: Server;

    private constructor(params: {
        gateway: Gateway;
        client: ReturnType<typeof createGatewayClient>;
        echoServerSSEInstance: Server;
        kitchenSinkServerInstance: Server;
        fooBarServerInstance: Server;
    }) {
        this.gateway = params.gateway;
        this.client = params.client;
        this.echoServerSSEInstance = params.echoServerSSEInstance;
        this.kitchenSinkServerInstance = params.kitchenSinkServerInstance;
        this.fooBarServerInstance = params.fooBarServerInstance;
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

        const echoServerSSEInstance = await serveOverSSE(
            makeEchoServer(),
            PROXY_TARGET_PORT,
          );
          const kitchenSinkServerInstance = await serveOverStreamable(
            makeKitchenSinkServer(),
            PROXY_TARGET_PORT + 1,
          );
          const fooBarServerInstance = await serveOverStreamable(
            makeFooBarServer(),
            PROXY_TARGET_PORT + 2,
          );
          
        return new IntegrationTestHarness({
            gateway,
            client,
            echoServerSSEInstance,
            kitchenSinkServerInstance,
            fooBarServerInstance,
        });
    }

    public async stop() {
        await this.gateway.proxyStore.purge();
        await this.gateway.stop();
        await this.echoServerSSEInstance?.close();
        await this.kitchenSinkServerInstance?.close();
        await this.fooBarServerInstance?.close();
    }



    public getConfigForTarget(targetName: string): ProxyTargetAttributes {
        const configs: Record<string, ProxyTargetAttributes> = {
            "echo": makeHTTPTargetConfig({
                name: "echo",
                url: `http://localhost:${PROXY_TARGET_PORT}/sse`,
            }),
            "kitchenSink": makeHTTPTargetConfig({
                name: "kitchen-sink",
                url: `http://localhost:${PROXY_TARGET_PORT + 1}/mcp`,
            }),
            "foobar": makeHTTPTargetConfig({
                name: "foobar",
                url: `http://localhost:${PROXY_TARGET_PORT + 2}/mcp`,
            })
        };

        const config = configs[targetName];
        if (!config) {
            throw new Error(`Unknown target name: ${targetName}`);
        }
        return config;
    }
}
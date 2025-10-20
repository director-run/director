import type { Server } from "node:http";
import {
  makeEchoServer,
  makeFooBarServer,
  makeKitchenSinkServer,
} from "@director.run/mcp/test/fixtures";
import { serveOverSSE, serveOverStreamable } from "@director.run/mcp/transport";
import { requiredStringSchema } from "@director.run/utilities/schema";
import { z } from "zod";
import { createGatewayClient } from "../client";
import { Gateway } from "../gateway";
import { makeTestConfig } from "./config";

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
    await this.gateway.playbookStore.purge();
  }

  public get database() {
    return this.gateway.config;
  }

  public static async start() {
    const config = await makeTestConfig();
    const gateway = await Gateway.start({
      config,
      baseUrl: `http://localhost:${config.get("server.port")}`,
    });

    const client = createGatewayClient(
      `http://localhost:${config.get("server.port")}`,
    );

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
    await this.gateway.playbookStore.purge();
    await this.gateway.stop();
    await this.echoServerSSEInstance?.close();
    await this.kitchenSinkServerInstance?.close();
    await this.fooBarServerInstance?.close();
  }

  public getConfigForTarget(targetName: string): {
    name: string;
    transport: HTTPTransport;
  } {
    const configs: Record<
      string,
      {
        name: string;
        transport: HTTPTransport;
      }
    > = {
      echo: makeHTTPTargetConfig({
        name: "echo",
        url: `http://localhost:${PROXY_TARGET_PORT}/sse`,
      }),
      kitchenSink: makeHTTPTargetConfig({
        name: "kitchen-sink",
        url: `http://localhost:${PROXY_TARGET_PORT + 1}/mcp`,
      }),
      foobar: makeHTTPTargetConfig({
        name: "foobar",
        url: `http://localhost:${PROXY_TARGET_PORT + 2}/mcp`,
      }),
    };

    const config = configs[targetName];
    if (!config) {
      throw new Error(`Unknown target name: ${targetName}`);
    }
    return config;
  }
}

export function makeHTTPTargetConfig(params: {
  name: string;
  url: string;
}): { name: string; transport: HTTPTransport } {
  return {
    name: params.name,
    transport: {
      type: "http",
      url: params.url,
    },
  };
}

export const httpTransportSchema = z.object({
  type: z.literal("http"),
  url: requiredStringSchema.url(),
  headers: z.record(requiredStringSchema, z.string()).optional(),
});

export type HTTPTransport = z.infer<typeof httpTransportSchema>;

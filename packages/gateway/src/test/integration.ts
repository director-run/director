import type { Server } from "node:http";
import {
  makeEchoServer,
  makeFooBarServer,
  makeKitchenSinkServer,
} from "@director.run/mcp/test/fixtures";
import { serveOverSSE, serveOverStreamable } from "@director.run/mcp/transport";
import { requiredStringSchema } from "@director.run/utilities/schema";
import { z } from "zod";
import {
  login as clientLogin,
  register as clientRegister,
  createGatewayClient,
} from "../client";
import { SERVER_PORT } from "../env";
import { Gateway } from "../gateway";
import { initializeTestDatabase, makeTestDatabase } from "./db";

const PROXY_TARGET_PORT = 4521;

export class IntegrationTestHarness {
  public readonly gateway: Gateway;
  public client: ReturnType<typeof createGatewayClient>;
  public static gatewayPort: number = SERVER_PORT;

  private echoServerSSEInstance: Server;
  private kitchenSinkServerInstance: Server;
  private fooBarServerInstance: Server;
  private sessionCookie: string | null = null;
  private baseURL: string;
  public userId: string | null = null;

  private constructor(params: {
    gateway: Gateway;
    client: ReturnType<typeof createGatewayClient>;
    echoServerSSEInstance: Server;
    kitchenSinkServerInstance: Server;
    fooBarServerInstance: Server;
    baseURL: string;
  }) {
    this.gateway = params.gateway;
    this.client = params.client;
    this.echoServerSSEInstance = params.echoServerSSEInstance;
    this.kitchenSinkServerInstance = params.kitchenSinkServerInstance;
    this.fooBarServerInstance = params.fooBarServerInstance;
    this.baseURL = params.baseURL;
  }

  /**
   * Initialize test database state.
   * @param keepUsers - When true, only deletes playbooks. When false, resets entire database.
   */
  public async initializeDatabase(keepUsers = false) {
    await initializeTestDatabase({
      playbookStore: this.gateway.playbookStore,
      keepUsers,
    });
  }

  public get database() {
    return this.gateway.database;
  }

  public getUserId(): string {
    if (!this.userId) {
      throw new Error(
        "User not authenticated. Call register() or login() first.",
      );
    }
    return this.userId;
  }

  public async register(params: {
    email: string;
    password: string;
  }): Promise<{ user: { id: string; email: string } }> {
    const { user, sessionCookie } = await clientRegister(this.baseURL, params);

    // Activate user for testing - new users are PENDING by default
    await this.gateway.database.activateUser(user.id);

    this.sessionCookie = sessionCookie;
    this.userId = user.id;

    // Recreate client with new session
    this.client = createGatewayClient(this.baseURL, {
      getAuthToken: () => this.sessionCookie,
    });

    return { user };
  }

  public async login(params: {
    email: string;
    password: string;
  }): Promise<{ user: { id: string; email: string } }> {
    const { user, sessionCookie } = await clientLogin(this.baseURL, params);

    this.sessionCookie = sessionCookie;
    this.userId = user.id;

    // Recreate client with new session
    this.client = createGatewayClient(this.baseURL, {
      getAuthToken: () => this.sessionCookie,
    });

    return { user };
  }

  public logout(): void {
    this.sessionCookie = null;
    this.userId = null;

    // Recreate client without session
    this.client = createGatewayClient(this.baseURL);
  }

  public static async start() {
    const database = makeTestDatabase();

    // Initialize test database before starting
    await initializeTestDatabase({});

    const baseURL = `http://localhost:${SERVER_PORT}`;

    const gateway = await Gateway.start({
      database,
      baseUrl: baseURL,
      port: SERVER_PORT,
      oauth: {
        storage: "memory",
        baseCallbackUrl: baseURL,
      },
    });

    const client = createGatewayClient(baseURL);

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
      baseURL,
    });
  }

  public async stop() {
    await this.initializeDatabase(true);
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

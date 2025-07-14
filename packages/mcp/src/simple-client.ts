import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import packageJson from "../package.json";

// const CONNECT_RETRY_INTERVAL = 2500;
// const CONNECT_RETRY_COUNT = 3;

const logger = getLogger("SimpleClient");

interface ErrnoException extends Error {
  code?: string;
}

export class SimpleClient extends Client {
  public name: string;
  private _isConnected: boolean = false;
  private _connectionStartTime?: Date;

  constructor(name: string) {
    super(
      {
        name,
        version: packageJson.version,
      },
      {
        capabilities: {
          prompts: {},
          resources: { subscribe: true },
          tools: {},
        },
      },
    );
    this.name = name;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public get connectionStartTime(): Date | undefined {
    return this._connectionStartTime;
  }

  public toPlainObject() {
    return {
      name: this.name,
      isConnected: this._isConnected,
      connectionStartTime: this._connectionStartTime,
    };
  }

  protected onConnected(): void {
    this._isConnected = true;
    this._connectionStartTime = new Date();
    logger.debug({
      message: `client connected`,
      name: this.name,
    });
  }

  protected onDisconnected(): void {
    this._isConnected = false;
    this._connectionStartTime = undefined;
    logger.debug({
      message: `client disconnected`,
      name: this.name,
    });
  }

  public async connectToHTTP(url: string, headers?: Record<string, string>) {
    try {
      await this.connect(
        new StreamableHTTPClientTransport(new URL(url), {
          requestInit: {
            headers,
          },
        }),
      );
      this.onConnected();
    } catch (e) {
      try {
        await this.connect(
          new SSEClientTransport(new URL(url), {
            requestInit: {
              headers,
            },
          }),
        );
        this.onConnected();
      } catch (e) {
        this.onDisconnected();
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to connect to ${url}`,
          {
            targetName: this.name,
            url,
            error: e,
          },
        );
      }
    }
  }

  public async connectToStdio(
    command: string,
    args: string[],
    env?: Record<string, string>,
  ) {
    try {
      await this.connect(new StdioClientTransport({ command, args, env }));
      this.onConnected();
    } catch (e) {
      this.onDisconnected();
      if (e instanceof Error && (e as ErrnoException).code === "ENOENT") {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] command not found: '${command}'. Please make sure it is installed and available in your $PATH.`,
          {
            targetName: this.name,
            command,
            args,
            env,
          },
        );
      } else if (e instanceof McpError) {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to run '${[command, ...args].join(" ")}'. Please check the logs for more details.`,
          {
            targetName: this.name,
            command,
            args,
            env,
          },
        );
      } else {
        throw e;
      }
    }
  }

  public static async createAndConnectToServer(
    server: Server,
  ): Promise<SimpleClient> {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const client = new SimpleClient("test client");

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);

    return client;
  }

  public static async createAndConnectToHTTP(url: string) {
    const client = new SimpleClient("test streamable client");
    await client.connectToHTTP(url);
    return client;
  }

  public static async createAndConnectToStdio(
    command: string,
    args: string[],
    env?: Record<string, string>,
  ) {
    const client = new SimpleClient("test client");
    await client.connectToStdio(command, args, env);
    return client;
  }

  public async close(): Promise<void> {
    this.onDisconnected();
    await super.close();
  }

  public async healthCheck(): Promise<boolean> {
    if (!this._isConnected) {
      return false;
    }

    try {
      // Try a simple ping operation to check if the connection is still alive
      await this.ping();
      return true;
    } catch (error) {
      logger.debug({
        message: `health check failed`,
        name: this.name,
        error,
      });
      this.onDisconnected();
      return false;
    }
  }

  public async detailedHealthCheck(
    transport: unknown,
  ): Promise<{ isHealthy: boolean; responseTime?: number; error?: string }> {
    const startTime = Date.now();

    try {
      const isHealthy = await this.healthCheck();
      const responseTime = Date.now() - startTime;

      return {
        isHealthy,
        responseTime,
        error: isHealthy ? undefined : "Connection health check failed",
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        isHealthy: false,
        responseTime,
        error: errorMessage,
      };
    }
  }

  // TODO: not sure we need retry logic?
  // async connect(transport: Transport) {
  //   let count = 0;
  //   let retry = true;

  //   while (retry) {
  //     try {
  //       await super.connect(transport);
  //       break;
  //     } catch (error) {
  //       logger.error({
  //         message: `error while connecting to server "${this.name}"`,
  //         name: this.name,
  //         retriesRemaining: CONNECT_RETRY_COUNT - count,
  //         error: error,
  //       });

  //       count++;
  //       retry = count < CONNECT_RETRY_COUNT;
  //       if (retry) {
  //         try {
  //           await this.close();
  //         } catch {}
  //         await sleep(CONNECT_RETRY_INTERVAL);
  //       } else {
  //         try {
  //           await this.close();
  //         } catch {}
  //         throw error;
  //       }
  //     }
  //   }
  // }
}

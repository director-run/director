import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
// import { sleep } from "@director.run/utilities/os";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { ErrnoException } from "bun";
// import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import packageJson from "../package.json";

// const CONNECT_RETRY_INTERVAL = 2500;
// const CONNECT_RETRY_COUNT = 3;

const logger = getLogger("SimpleClient");

export class SimpleClient extends Client {
  public name: string;

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

  public toPlainObject() {
    return {
      name: this.name,
    };
  }

  public async connectToHTTP(url: string) {
    try {
      await this.connect(new StreamableHTTPClientTransport(new URL(url)));
    } catch (e) {
      try {
        await this.connect(new SSEClientTransport(new URL(url)));
      } catch (e) {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `failed to connect to ${url}`,
          {
            url,
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
    } catch (e) {
      const error = e as ErrnoException; // TODO: use the proper type. Is it? ErrnoException?
      if (error.code === "ENOENT") {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `command not found: '${command}'. Please make sure it is installed and available in your $PATH.`,
          {
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

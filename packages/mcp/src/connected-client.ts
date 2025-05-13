import { env } from "@director.run/config/env";
import { getLogger } from "@director.run/utilities/logger";
import { sleep } from "@director.run/utilities/os";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

const PROXY_TARGET_CONNECT_RETRY_INTERVAL = 2500;
const PROXY_TARGET_CONNECT_RETRY_COUNT = 3;

const logger = getLogger("SimpleClient");

export class SimpleClient extends Client {
  public name: string;

  constructor(name: string) {
    super(
      {
        name,
        version: env.VERSION,
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

  async connect(transport: Transport) {
    let count = 0;
    let retry = true;

    while (retry) {
      try {
        await super.connect(transport);
        break;
      } catch (error) {
        logger.error({
          message: `error while connecting to server "${this.name}"`,
          name: this.name,
          retriesRemaining: PROXY_TARGET_CONNECT_RETRY_COUNT - count,
          error: error,
        });

        count++;
        retry = count < PROXY_TARGET_CONNECT_RETRY_COUNT;
        if (retry) {
          try {
            await this.close();
          } catch {}
          await sleep(PROXY_TARGET_CONNECT_RETRY_INTERVAL);
        } else {
          try {
            await this.close();
          } catch {}
          throw error;
        }
      }
    }
  }
}

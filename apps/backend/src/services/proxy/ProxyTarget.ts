import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  PROXY_TARGET_CONNECT_RETRY_COUNT,
  PROXY_TARGET_CONNECT_RETRY_INTERVAL,
  VERSION,
} from "../../config";
import { getLogger } from "../../helpers/logger";
import { sleep } from "../../helpers/util";
import type { McpServer } from "../db/schema";

const logger = getLogger("ProxyTarget");
export class ProxyTarget {
  public client: Client;
  private transport: Transport;
  private targetServer: McpServer;

  get name() {
    return this.targetServer.name;
  }

  public toPlainObject() {
    return {
      ...this.targetServer,
    };
  }

  constructor(targetServer: McpServer) {
    this.targetServer = targetServer;

    if (this.targetServer.transport.type === "sse") {
      this.transport = new SSEClientTransport(
        new URL(this.targetServer.transport.url),
      );
    } else {
      this.transport = new StdioClientTransport({
        command: this.targetServer.transport.command,
        args: this.targetServer.transport.args,
        env: this.targetServer.transport.env
          ? this.targetServer.transport.env.reduce(
              (_, v) => ({
                [v]: process.env[v] || "",
              }),
              {},
            )
          : undefined,
      });
    }

    if (!this.transport) {
      throw new Error(`Transport ${this.targetServer.name} not available.`);
    }

    this.client = new Client(
      {
        name: this.name,
        version: VERSION,
      },
      {
        capabilities: {
          prompts: {},
          resources: { subscribe: true },
          tools: {},
        },
      },
    );
  }

  async connect() {
    let count = 0;
    let retry = true;

    while (retry) {
      try {
        await this.client.connect(this.transport);
        break;
      } catch (error) {
        logger.error({
          message: `error while connecting to server "${this.targetServer.name}"`,
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

  async close() {
    await this.client.close();
  }
}

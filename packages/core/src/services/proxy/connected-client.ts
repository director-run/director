import { sleep } from "@director.run/utilities/sleep";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { env } from "../../helpers/env";
import { getLogger } from "../../helpers/logger";

export const PROXY_TARGET_CONNECT_RETRY_INTERVAL = 2500;
export const PROXY_TARGET_CONNECT_RETRY_COUNT = 3;

const logger = getLogger("ConnectedClient");

export class ConnectedClient extends Client {
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

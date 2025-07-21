import {} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import {} from "@modelcontextprotocol/sdk/client/auth.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import packageJson from "../../package.json";

// const CONNECT_RETRY_INTERVAL = 2500;
// const CONNECT_RETRY_COUNT = 3;

const logger = getLogger("SimpleClient");

export type ClientStatus =
  | "connected"
  | "disconnected"
  | "unauthorized"
  | "error";

export abstract class AbstractClient extends Client {
  public name: string;
  public status: ClientStatus = "disconnected";
  public lastConnectedAt: Date | null = null;
  public lastError: Error | null = null;

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
      status: this.status,
      lastConnectedAt: this.lastConnectedAt,
      lastError: this.lastError,
    };
  }

  public abstract connectToTarget({
    throwOnError,
  }: {
    throwOnError: boolean;
  }): Promise<void>;
}

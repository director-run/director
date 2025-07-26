import type { ProxyTargetSource } from "@director.run/utilities/schema";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import packageJson from "../../package.json";

export type ClientStatus =
  | "connected"
  | "disconnected"
  | "unauthorized"
  | "error";

// TODO: use generic type for source so it makes a better sdk
export abstract class AbstractClient extends Client {
  public readonly name: string;
  public status: ClientStatus = "disconnected";
  public lastConnectedAt?: Date;
  public lastErrorMessage?: string;
  public readonly source?: ProxyTargetSource;

  constructor(params: { name: string; source?: ProxyTargetSource }) {
    const { name, source } = params;
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
    this.source = source;
  }

  public abstract connectToTarget({
    throwOnError,
  }: {
    throwOnError: boolean;
  }): Promise<boolean>;
}

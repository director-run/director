import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import packageJson from "../../package.json";

export type ClientStatus =
  | "connected"
  | "disconnected"
  | "unauthorized"
  | "error";

export type SerializedClient = {
  name: string;
  status: ClientStatus;
  lastConnectedAt?: Date;
  lastErrorMessage?: string;
  command: string;
  type: "http" | "stdio" | "in-memory";
};

export abstract class AbstractClient extends Client {
  public readonly name: string;
  public status: ClientStatus = "disconnected";
  public lastConnectedAt?: Date;
  public lastErrorMessage?: string;

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

  public abstract toPlainObject(): SerializedClient;

  public abstract connectToTarget({
    throwOnError,
  }: {
    throwOnError: boolean;
  }): Promise<boolean>;
}

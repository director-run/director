import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import packageJson from "../../package.json";

export type ClientStatus =
  | "connected"
  | "disconnected"
  | "unauthorized"
  | "error";

export abstract class AbstractClient extends Client {
  public readonly name: string;
  public status: ClientStatus = "disconnected";
  public lastConnectedAt?: Date;
  public lastErrorMessage?: string;

  constructor(params: { name: string }) {
    const { name } = params;
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

  public abstract connectToTarget({
    throwOnError,
  }: {
    throwOnError: boolean;
  }): Promise<boolean>;
}

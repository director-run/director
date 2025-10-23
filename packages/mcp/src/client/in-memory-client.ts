import { getLogger } from "@director.run/utilities/logger";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { ClientStatus } from "./abstract-client";
import { AbsractClientSchema, AbstractClient } from "./abstract-client";

const _logger = getLogger("client/in-memory");

export const InMemoryClientSchema = AbsractClientSchema.extend({});

export type InMemoryClientParams = z.infer<typeof InMemoryClientSchema>;
export type InMemoryClientOptions = {
  server: Server;
};

export class InMemoryClient extends AbstractClient<InMemoryClientParams> {
  protected server: Server;

  constructor(params: InMemoryClientParams, options: InMemoryClientOptions) {
    super(params);
    this.server = options.server;
  }

  public static async createAndConnectToServer(
    server: Server,
  ): Promise<InMemoryClient> {
    const client = new InMemoryClient(
      {
        name: "test client",
      },
      {
        server,
      },
    );

    await client.connectToTarget({ throwOnError: true });

    return client;
  }

  public async connectToTarget({
    throwOnError: _throwOnError,
  }: { throwOnError: boolean }) {
    if (this._disabled) {
      this.status = "disconnected";
      return false;
    }

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await Promise.all([
      this.connect(clientTransport),
      this.server.connect(serverTransport),
    ]);

    this.status = "connected";
    this.lastConnectedAt = new Date();
    this.lastErrorMessage = undefined;
    return true;
  }

  public async toPlainObject(include?: {
    tools?: boolean;
    connectionInfo?: boolean;
  }): Promise<
    InMemoryClientParams & {
      type: "mem";
      toolsList?: Tool[];
      connectionInfo?: {
        status: ClientStatus;
        lastConnectedAt?: Date;
        lastErrorMessage?: string;
      };
    }
  > {
    return {
      type: "mem",
      name: this.name,
      source: this.source,
      tools: this.tools,
      prompts: this.prompts,
      disabled: this.disabled,
      toolsList: include?.tools
        ? (await this.originalListTools()).tools
        : undefined,
      connectionInfo: include?.connectionInfo
        ? {
            status: this.status,
            lastConnectedAt: this.lastConnectedAt,
            lastErrorMessage: this.lastErrorMessage,
          }
        : undefined,
    };
  }
}

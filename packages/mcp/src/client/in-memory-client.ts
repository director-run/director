import {} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { AbstractClient, type AbstractClientParams } from "./abstract-client";

const logger = getLogger("client/in-memory");

export type InMemoryClientParams = AbstractClientParams & {
  server: Server;
};

export class InMemoryClient extends AbstractClient {
  protected server: Server;

  constructor(params: InMemoryClientParams) {
    super({
      name: params.name,
      source: params.source,
      toolPrefix: params.toolPrefix,
      disabledTools: params.disabledTools,
      disabled: params.disabled,
    });
    this.server = params.server;
  }

  public static async createAndConnectToServer(
    server: Server,
  ): Promise<InMemoryClient> {
    const client = new InMemoryClient({
      name: "test client",
      server,
    });

    await client.connectToTarget({ throwOnError: true });

    return client;
  }

  public async connectToTarget({ throwOnError }: { throwOnError: boolean }) {
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
}

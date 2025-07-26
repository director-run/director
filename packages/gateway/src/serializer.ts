import type { ClientStatus } from "@director.run/mcp/client/abstract-client";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import { Database } from "./db";
import { getStreamablePathForProxy } from "./helpers";

type SerializedTarget = {
  name: string;
  status: ClientStatus;
  lastConnectedAt?: Date;
  lastErrorMessage?: string;
  command: string;
  type: "http" | "stdio" | "in-memory";
};

export class Serializer {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async serializeProxyServer(proxy: ProxyServer) {
    const proxyDbEntry = await this.db.getProxy(proxy.id);

    return {
      id: proxy.id,
      name: proxy.name,
      description: proxy.description,
      addToolPrefix: proxy.addToolPrefix,
      servers: proxy.targets.map((target) => {
        const serverDBEntry = proxyDbEntry.servers.find(
          (s) => s.name.toLocaleLowerCase() === target.name.toLocaleLowerCase(),
        );

        return {
          ...target,
          source: serverDBEntry?.source,
          transport: serverDBEntry?.transport,
        };
      }),
      path: getStreamablePathForProxy(proxy.id),
    };
  }

  async serializeProxyServers(proxies: ProxyServer[]) {
    const ret = [];
    for (const proxy of proxies) {
      ret.push(await this.serializeProxyServer(proxy));
    }
    return ret;
  }

  serializeProxyServerTarget(
    target: HTTPClient | StdioClient,
  ): SerializedTarget {
    if (target instanceof HTTPClient) {
      return {
        name: target.name,
        status: target.status,
        lastConnectedAt: target.lastConnectedAt,
        lastErrorMessage: target.lastErrorMessage,
        command: target.url,
        type: "http",
      };
    } else if (target instanceof StdioClient) {
      return {
        name: target.name,
        status: target.status,
        lastConnectedAt: target.lastConnectedAt,
        lastErrorMessage: target.lastErrorMessage,
        command: [target.command, ...(target.args ?? [])].join(" "),
        type: "stdio",
      };
    } else {
      throw new Error("Unknown target type");
    }
  }
}

import type { ClientStatus } from "@director.run/mcp/client/abstract-client";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import { getStreamablePathForProxy } from "./helpers";

type SerializedTarget = {
  name: string;
  status: ClientStatus;
  lastConnectedAt?: Date;
  lastErrorMessage?: string;
  command: string;
  type: "http" | "stdio" | "in-memory";
};

export function serializeProxyServer(proxy: ProxyServer) {
  return {
    id: proxy.id,
    name: proxy.name,
    description: proxy.description,
    addToolPrefix: proxy.addToolPrefix,
    targets: proxy.targets.map((target) => serializeProxyServerTarget(target)),

    //   servers: proxy.targets.map((target) => {
    //     const serverDBEntry = proxyDbEntry.servers.find(
    //       (s) => s.name.toLocaleLowerCase() === target.name.toLocaleLowerCase(),
    //     );

    //     return {
    //       ...target,
    //       source: serverDBEntry?.source,
    //       transport: serverDBEntry?.transport,
    //     };
    //   }),
    path: getStreamablePathForProxy(proxy.id),
  };
}

export function serializeProxyServers(proxies: ProxyServer[]) {
  const ret = [];
  for (const proxy of proxies) {
    ret.push(serializeProxyServer(proxy));
  }
  return ret;
}

export function serializeProxyServerTarget(
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

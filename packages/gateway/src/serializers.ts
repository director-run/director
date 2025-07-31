import type { ClientStatus } from "@director.run/mcp/client/abstract-client";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import type { ProxyTargetSource } from "@director.run/utilities/schema";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getStreamablePathForProxy } from "./helpers";

type SerializedTarget = {
  name: string;
  status: ClientStatus;
  lastConnectedAt?: Date;
  lastErrorMessage?: string;
  command: string;
  type: "http" | "stdio" | "in-memory";
  transport:
    | {
        type: "http";
        url: string;
      }
    | {
        type: "stdio";
        command: string;
        args: string[];
        env?: Record<string, string>;
      };
  source?: ProxyTargetSource;
  toolPrefix?: string;
  disabledTools?: string[];
  disabled?: boolean;
  tools?: Tool[];
};

export async function serializeProxyServer(proxy: ProxyServer) {
  const targets: SerializedTarget[] = [];
  for (const target of proxy.targets) {
    targets.push(await serializeProxyServerTarget(target));
  }

  return {
    id: proxy.id,
    name: proxy.name,
    description: proxy.description,
    addToolPrefix: proxy.addToolPrefix,
    targets,
    servers: targets,
    path: getStreamablePathForProxy(proxy.id),
  };
}

export async function serializeProxyServers(proxies: ProxyServer[]) {
  const ret = [];
  for (const proxy of proxies) {
    ret.push(await serializeProxyServer(proxy));
  }
  return ret;
}

export async function serializeProxyServerTarget(
  target: HTTPClient | StdioClient,
  params?: {
    includeTools?: boolean;
  },
): Promise<SerializedTarget> {
  let tools: Tool[] | undefined;
  if (params?.includeTools && target.isConnected()) {
    tools = (await target.originalListTools()).tools;
  }

  if (target instanceof HTTPClient) {
    return {
      name: target.name,
      status: target.status,
      lastConnectedAt: target.lastConnectedAt,
      lastErrorMessage: target.lastErrorMessage,
      command: target.url,
      type: "http",
      transport: {
        type: "http",
        url: target.url,
      },
      source: target.source,
      toolPrefix: target.toolPrefix,
      disabledTools: target.disabledTools,
      disabled: target.disabled,
      tools,
    };
  } else if (target instanceof StdioClient) {
    return {
      name: target.name,
      status: target.status,
      lastConnectedAt: target.lastConnectedAt,
      lastErrorMessage: target.lastErrorMessage,
      command: [target.command, ...(target.args ?? [])].join(" "),
      type: "stdio",
      transport: {
        type: "stdio",
        command: target.command,
        args: target.args,
        env: target.env,
      },
      source: target.source,
      toolPrefix: target.toolPrefix,
      disabledTools: target.disabledTools,
      disabled: target.disabled,
      tools,
    };
  } else {
    throw new Error("Unknown target type");
  }
}

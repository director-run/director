import type { ClientStatus } from "@director.run/mcp/client/abstract-client";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import { InMemoryClient } from "@director.run/mcp/client/in-memory-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import {
  ProxyServer,
  type ProxyTarget,
} from "@director.run/mcp/proxy/proxy-server";
import type { ProxyTargetSource } from "@director.run/utilities/schema";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { Prompt } from "./capabilities/prompt-manager";
import { getStreamablePathForProxy } from "./helpers";

type SerializedTarget = {
  name: string;
  status: ClientStatus;
  lastConnectedAt?: Date;
  lastErrorMessage?: string;
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
      }
    | {
        type: "mem";
      };
  source?: ProxyTargetSource;
  toolPrefix?: string;
  disabledTools?: string[];
  disabled?: boolean;
  tools?: Tool[];
};

export async function serializeProxyServer(
  proxy: ProxyServer,
  params?: { includeInMemoryTargets?: boolean; prompts?: Prompt[] },
) {
  const targets: SerializedTarget[] = [];
  for (const target of proxy.targets) {
    if (!params?.includeInMemoryTargets && target instanceof InMemoryClient) {
      continue;
    }
    targets.push(await serializeProxyServerTarget(target));
  }

  return {
    id: proxy.id,
    name: proxy.name,
    description: proxy.description,
    prompts: params?.prompts,
    addToolPrefix: proxy.addToolPrefix,
    targets,
    servers: targets,
    path: getStreamablePathForProxy(proxy.id),
  };
}

export async function serializeProxyServers(
  proxies: ProxyServer[],
  params?: { includeInMemoryTargets?: boolean },
) {
  const ret = [];
  for (const proxy of proxies) {
    ret.push(await serializeProxyServer(proxy, params));
  }
  return ret;
}

export async function serializeProxyServerTarget(
  target: ProxyTarget,
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
  } else if (target instanceof InMemoryClient) {
    return {
      name: target.name,
      status: target.status,
      lastConnectedAt: target.lastConnectedAt,
      lastErrorMessage: target.lastErrorMessage,
      transport: {
        type: "mem",
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

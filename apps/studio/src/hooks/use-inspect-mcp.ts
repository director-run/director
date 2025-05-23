"use client";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Prompt, Resource, Tool } from "@modelcontextprotocol/sdk/types.js";
import { useEffect, useState } from "react";

export function useInspectMcp(proxyId: string, serverId?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const client = new Client({
      name: "director",
      version: "0.0.1",
    });

    const transport = new SSEClientTransport(
      new URL(`http://localhost:3673/${proxyId}/sse`),
    );

    client.connect(transport).then(() => {
      Promise.all([
        client.listTools().then(({ tools }) => {
          setTools(
            tools.filter((tool) => {
              if (serverId) {
                return tool.description?.startsWith(`[${serverId}]`);
              }
              return true;
            }),
          );
        }),
      ]).then(() => {
        setIsLoading(false);
        client.close();
      });
    });

    return () => {
      client.close();
    };
  }, [proxyId, serverId]);

  return {
    isLoading,
    tools,
    prompts,
    resources,
  };
}

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Prompt, Resource, Tool } from "@modelcontextprotocol/sdk/types.js";
import { useEffect, useState } from "react";
import { useIsMounted } from "usehooks-ts";

export function useMcpClient(proxyId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    setIsLoading(true);

    const transport = new SSEClientTransport(
      new URL(`http://localhost:3000/${proxyId}/sse`),
    );
    const client = new Client({
      name: "director",
      version: "0.0.0",
    });

    client.connect(transport).then(() => {
      Promise.all([
        client.listTools(),
        client.listResources(),
        client.listPrompts(),
      ])
        .then(([tools, resources, prompts]) => {
          setTools(tools.tools);
          setResources(resources.resources);
          setPrompts(prompts.prompts);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    return () => {
      client?.close();
      setIsLoading(false);
    };
  }, [isMounted]);

  return { isLoading, tools, resources, prompts };
}

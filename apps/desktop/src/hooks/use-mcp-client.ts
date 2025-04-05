import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Prompt, Resource, Tool } from "@modelcontextprotocol/sdk/types.js";
import { useEffect, useState } from "react";
import { useIsMounted } from "usehooks-ts";

export function useMcpClient(proxyId: string) {
  const [client, setClient] = useState<Client | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const transport = new SSEClientTransport(
      new URL(`http://localhost:3000/${proxyId}/sse`),
    );
    const client = new Client({
      name: "director",
      version: "0.0.0",
    });

    client.connect(transport).then(() => {
      setClient(client);
    });

    return () => {
      client?.close();
      setClient(null);
    };
  }, [isMounted]);

  return client;
}

export function useTools(proxyId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const client = useMcpClient(proxyId);

  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    if (!client) {
      return;
    }

    setIsLoading(true);

    console.log(client.getServerCapabilities());

    client
      .listTools()
      .then((res) => {
        setTools(res.tools);
      })
      .catch((res) => {
        console.error(res);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client]);

  return { tools, isLoading };
}

export function useResources(proxyId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const client = useMcpClient(proxyId);

  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    if (!client) {
      return;
    }

    setIsLoading(true);

    client
      .listResources()
      .then((res) => {
        setResources(res.resources);
      })
      .catch((res) => {
        console.error(res);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client]);

  return { resources, isLoading };
}

export function usePrompts(proxyId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const client = useMcpClient(proxyId);

  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    if (!client) {
      return;
    }

    setIsLoading(true);

    client
      .listPrompts()
      .then((res) => {
        setPrompts(res.prompts);
      })
      .catch((res) => {
        console.error(res);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [client]);

  return { prompts, isLoading };
}

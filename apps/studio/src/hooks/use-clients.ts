import type { Client } from "@director.run/design/components/types.ts";
import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import { gatewayClient } from "../contexts/backend-context";

type InstallerApi = GatewayRouterOutputs["clients"]["allClients"][number];

const catalog: Array<Omit<Client, "installed" | "present">> = [
  {
    id: "claude",
    label: "Claude",
    image: new URL("/assets/icons/claude-icon.png", import.meta.url).href,
  },
  {
    id: "claude-code",
    label: "Claude Code",
    image: new URL("/assets/icons/claude-icon.png", import.meta.url).href,
  },
  {
    id: "cursor",
    label: "Cursor",
    image: new URL("/assets/icons/cursor-icon.png", import.meta.url).href,
  },
  {
    id: "vscode",
    label: "VSCode",
    image: new URL("/assets/icons/code-icon.png", import.meta.url).href,
  },
];

export function useClients(playbookId: string): {
  data?: Client[];
  isLoading: boolean;
} {
  const availableClients = gatewayClient.clients.allClients.useQuery();

  const isLoading = availableClients.isLoading;

  const mappedInstallers: Client[] | null = isLoading
    ? null
    : (availableClients.data
        ?.map((apiClient: InstallerApi) => {
          const meta = catalog.find((c) => c.id === apiClient.name);
          if (!meta) {
            return null;
          }

          return {
            id: meta.id,
            label: meta.label,
            image: meta.image,
            installed: apiClient.installed,
            present: !!apiClient.workspaces?.some((w) => w.id === playbookId),
          } as Client;
        })
        .filter((c): c is Client => c !== null) ?? []);

  const data: Client[] | null = isLoading
    ? null
    : [...(mappedInstallers ?? [])];

  return {
    data: data ?? undefined,
    isLoading,
  };
}

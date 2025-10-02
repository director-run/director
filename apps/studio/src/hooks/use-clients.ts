import type {
  Client,
  ConfiguratorTarget,
} from "@director.run/design/components/types.ts";
import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import { gatewayClient } from "../contexts/backend-context";

type InstallerApi = GatewayRouterOutputs["installer"]["allClients"][number];

const catalog: Array<Omit<Client, "installed" | "present">> = [
  {
    id: "claude",
    label: "Claude",
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

export function useClients(workspaceId: string): {
  data?: Client[];
  isLoading: boolean;
} {
  const [clients, availableClients] = gatewayClient.useQueries((t) => [
    t.installer.byProxy.list({ proxyId: workspaceId }),
    t.installer.allClients(),
  ]);

  const isLoading = availableClients.isLoading || clients.isLoading;

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
            present: !!clients?.data?.[apiClient.name as ConfiguratorTarget],
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

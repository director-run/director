import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import type { Client } from "@director.run/studio/components/proxies/proxy-installers.tsx";
import type { ConfiguratorTarget } from "@director.run/studio/components/types.ts";
import { gatewayClient } from "../contexts/backend-context";

type InstallerApi = GatewayRouterOutputs["installer"]["allClients"][number];

const catalog: Array<Omit<Client, "installed" | "present">> = [
  {
    id: "claude",
    label: "Claude",
    image: new URL("/assets/icons/claude-icon.png", import.meta.url).href,
    type: "installer",
  },
  {
    id: "cursor",
    label: "Cursor",
    image: new URL("/assets/icons/cursor-icon.png", import.meta.url).href,
    type: "installer",
  },
  {
    id: "vscode",
    label: "VSCode",
    image: new URL("/assets/icons/code-icon.png", import.meta.url).href,
    type: "installer",
  },
  {
    id: "goose",
    label: "Goose",
    image: new URL("/assets/icons/goose-icon.png", import.meta.url).href,
    type: "deep-link",
  },
  {
    id: "raycast",
    label: "Raycast",
    image: new URL("/assets/icons/raycast-icon.png", import.meta.url).href,
    type: "deep-link",
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
          if (meta.type !== "installer") {
            return null;
          }
          return {
            id: meta.id,
            label: meta.label,
            image: meta.image,
            type: meta.type,
            installed: apiClient.installed,
            present: !!clients?.data?.[apiClient.name as ConfiguratorTarget],
          } as Client;
        })
        .filter((c): c is Client => c !== null) ?? []);

  const deepLinks: Client[] = catalog
    .filter((c) => c.type === "deep-link")
    .map((c) => ({ ...c }));

  const data: Client[] | null = isLoading
    ? null
    : [...(mappedInstallers ?? []), ...deepLinks];

  return {
    data: data ?? undefined,
    isLoading,
  };
}

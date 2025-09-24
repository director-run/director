import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import type { Client } from "../components/proxies/proxy-installers";
import type { ConfiguratorTarget } from "../components/types";
import { trpc } from "../state/client";

type InstallerApi = GatewayRouterOutputs["installer"]["allClients"][number];

const catalog: Array<Omit<Client, "installed" | "present">> = [
  {
    id: "claude",
    label: "Claude",
    image: "/icons/claude-icon.png",
    type: "installer",
  },
  {
    id: "cursor",
    label: "Cursor",
    image: "/icons/cursor-icon.png",
    type: "installer",
  },
  {
    id: "vscode",
    label: "VSCode",
    image: "/icons/code-icon.png",
    type: "installer",
  },
  {
    id: "goose",
    label: "Goose",
    image: "/icons/goose-icon.png",
    type: "deep-link",
  },
  {
    id: "raycast",
    label: "Raycast",
    image: "/icons/raycast-icon.png",
    type: "deep-link",
  },
];

export function useClients(workspaceId: string): {
  data?: Client[];
  isLoading: boolean;
} {
  const [clients, availableClients] = trpc.useQueries((t) => [
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

import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import type { ConfiguratorTarget } from "../components/types";
import { trpc } from "../state/client";

type C = GatewayRouterOutputs["installer"]["allClients"][number] & {
  present: boolean;
  label: string;
  image: string;
  type: "installer";
};

const cc = [
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
  data?: C[];
  isLoading: boolean;
} {
  const [clients, availableClients] = trpc.useQueries((t) => [
    t.installer.byProxy.list({ proxyId: workspaceId }),
    t.installer.allClients(),
  ]);

  const isLoading = availableClients.isLoading || clients.isLoading;

  const data = isLoading
    ? null
    : availableClients.data
        ?.map((client) => {
          const c = cc.find((c) => c.id === client.name);
          if (!c) {
            return null;
          }
          return {
            ...client,
            present: !!clients?.data?.[client.name as ConfiguratorTarget],
            label: c.label,
            image: c.image,
            type: c.type,
          };
        })
        .filter((c): c is C => c !== null);

  return {
    data: data ?? undefined,
    isLoading,
  };
}

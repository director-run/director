"use client";

import {
  registryQuerySerializer,
  useRegistryQuery,
} from "@/hooks/use-registry-query";
import { GatewayRouterOutputs } from "@director.run/gateway/client";
import { ListOfLinks } from "../list-of-links";

interface RegistryToolsProps {
  tools: GatewayRouterOutputs["registry"]["getEntryByName"]["tools"];
}

export function RegistryTools({ tools }: RegistryToolsProps) {
  const { serverId } = useRegistryQuery();

  return (
    <ListOfLinks
      isLoading={false}
      links={(tools ?? [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((it) => {
          return {
            title: it.name,
            subtitle: it.description?.replace(/\[([^\]]+)\]/g, ""),
            scroll: false,
            href: `${registryQuerySerializer({
              toolId: it.name,
              serverId,
            })}`,
          };
        })}
    />
  );
}

"use client";

import {
  registryQuerySerializer,
  useRegistryQuery,
} from "@/hooks/use-registry-query";
import { RegistryGetEntryTools } from "@/trpc/types";
import { ListOfLinks } from "../list-of-links";

interface RegistryToolsProps {
  tools: RegistryGetEntryTools;
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

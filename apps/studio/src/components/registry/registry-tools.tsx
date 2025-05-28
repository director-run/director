"use client";

import { Tool } from "@director.run/registry/db/schema";

import {
  registryQuerySerializer,
  useRegistryQuery,
} from "@/hooks/use-registry-query";
import { ListOfLinks } from "../list-of-links";

interface RegistryToolsProps {
  tools: Tool[];
}

export function RegistryTools({ tools }: RegistryToolsProps) {
  const { serverId } = useRegistryQuery();

  return (
    <ListOfLinks
      isLoading={false}
      links={tools
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

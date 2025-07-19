"use client";

import {
  ViewNavigation,
  ViewNavigationLink,
} from "@director.run/design/components/view";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export function MCPToolNavigation() {
  const { serverId, toolId } = useParams<{
    serverId: string;
    toolId: string;
  }>();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ViewNavigation>
      <ViewNavigationLink
        asChild
        isSelected={selected === null}
        onClick={() => setSelected(null)}
      >
        <Link href={`/${serverId}/tools/${toolId}`}>
          <span>Overview</span>
        </Link>
      </ViewNavigationLink>
      <ViewNavigationLink
        asChild
        isSelected={selected === "description"}
        onClick={() => setSelected("description")}
      >
        <Link href="#description">
          <span>Description</span>
        </Link>
      </ViewNavigationLink>
      <ViewNavigationLink
        asChild
        isSelected={selected === "input-schema"}
        onClick={() => setSelected("input-schema")}
      >
        <Link href="#input-schema">
          <span>Input schema</span>
        </Link>
      </ViewNavigationLink>
    </ViewNavigation>
  );
}

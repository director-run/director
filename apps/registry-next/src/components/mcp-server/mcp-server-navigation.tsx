"use client";

import {
  ViewNavigation,
  ViewNavigationLink,
} from "@director.run/design/components/view";
import { RegistryEntry } from "@director.run/utilities/schema";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

interface MCPServerNavigationProps
  extends ComponentProps<typeof ViewNavigation> {
  server: RegistryEntry;
}

export function MCPServerNavigation({
  server,
  ...props
}: MCPServerNavigationProps) {
  const pathname = usePathname();

  return (
    <ViewNavigation {...props}>
      <ViewNavigationLink isSelected={pathname === `/${server.name}`} asChild>
        <NextLink href={`/${server.name}`}>
          <span>Overview</span>
        </NextLink>
      </ViewNavigationLink>
      <ViewNavigationLink
        isSelected={pathname === `/${server.name}/installation`}
        asChild
      >
        <NextLink href={`/${server.name}/installation`}>
          <span>Installation</span>
        </NextLink>
      </ViewNavigationLink>
      <ViewNavigationLink
        isSelected={pathname === `/${server.name}/readme`}
        asChild
      >
        <NextLink href={`/${server.name}/readme`}>
          <span>README.md</span>
        </NextLink>
      </ViewNavigationLink>
      <ViewNavigationLink
        isSelected={pathname === `/${server.name}/tools`}
        asChild
      >
        <NextLink href={`/${server.name}/tools`}>
          <span>Tools</span>
        </NextLink>
      </ViewNavigationLink>
    </ViewNavigation>
  );
}

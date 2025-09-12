"use client";

import { ListOfLinks } from "../list-of-links";

interface RegistryToolsProps {
  links: Array<{
    title: string;
    subtitle?: string;
    href: string;
    scroll?: boolean;
  }>;
}

export function RegistryTools({ links }: RegistryToolsProps) {
  return <ListOfLinks isLoading={false} links={links} />;
}

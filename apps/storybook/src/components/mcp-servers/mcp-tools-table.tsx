"use client";
import { ListOfLinks } from "../list-of-links";

interface McpToolTableProps {
  links: Array<{
    title: string;
    subtitle: string;
    scroll: boolean;
    href: string;
    badges?: React.ReactNode;
  }>;
  isLoading: boolean;
}

export function McpToolsTable({ links, isLoading }: McpToolTableProps) {
  return <ListOfLinks isLoading={isLoading} links={links} />;
}

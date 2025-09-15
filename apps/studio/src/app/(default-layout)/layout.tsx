"use client";

import {
  BookOpenTextIcon,
  GithubLogoIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { LayoutRoot } from "../../components/layout/layout";
import type { NavigationSection } from "../../components/layout/navigation";
import { MCPIcon } from "../../components/ui/icons/mcp-icon";
import { trpc } from "../../state/client";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { proxyId } = useParams<{ proxyId?: string }>();
  const { data: servers, isLoading, error } = trpc.store.getAll.useQuery();

  const showLoading = isLoading || error?.message === "Failed to fetch";

  const sections: NavigationSection[] = [
    // Library section
    {
      id: "library",
      label: "Library",
      items: [
        {
          id: "mcp",
          label: "MCP",
          icon: <MCPIcon />,
          isActive: pathname.startsWith("/library"),
          onClick: () => router.push("/library"),
        },
      ],
    },
    // Servers section
    {
      id: "servers",
      label: "Servers",
      isLoading: showLoading,
      items:
        servers?.map((server) => ({
          id: server.id,
          label: server.name,
          isActive: server.id === proxyId,
          onClick: () => router.push(`/${server.id}`),
        })) || [],
    },
    // Bottom actions section
    {
      id: "actions",
      items: [
        {
          id: "new-server",
          label: "New server",
          icon: <PlusIcon />,
          isActive: pathname === "/new",
          onClick: () => router.push("/new"),
        },
        {
          id: "documentation",
          label: "Documentation",
          icon: <BookOpenTextIcon weight="fill" />,
          onClick: () =>
            window.open(
              "https://docs.director.run",
              "_blank",
              "noopener noreferrer",
            ),
        },
        {
          id: "github",
          label: "Github",
          icon: <GithubLogoIcon />,
          onClick: () =>
            window.open(
              "https://github.com/director-run/director",
              "_blank",
              "noopener noreferrer",
            ),
        },
      ],
    },
  ];

  return <LayoutRoot sections={sections}>{children}</LayoutRoot>;
}

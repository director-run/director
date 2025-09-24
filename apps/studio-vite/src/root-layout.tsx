import "./fonts.css";
import "./globals.css";
import { ChatToUs } from "@director.run/studio/components/chat-to-us.tsx";
import {
  LayoutRoot,
  LayoutView,
} from "@director.run/studio/components/layout/layout.tsx";
import { MCPIcon } from "@director.run/studio/components/ui/icons/mcp-icon.tsx";
import {
  BookOpenTextIcon,
  GithubLogoIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useWorkspaces } from "./hooks/use-workspaces";

export const RootLayout = () => {
  const navigate = useNavigate();
  const { data: servers, isLoading, error } = useWorkspaces();
  const showLoading = isLoading || error?.message === "Failed to fetch";
  const location = useLocation();

  return (
    <LayoutRoot
      sections={[
        {
          id: "library",
          label: "Library",
          items: [
            {
              id: "mcp",
              label: "MCP",
              icon: <MCPIcon />,
              isActive: location.pathname === "/library",
              onClick: () => navigate(`/library`),
            },
          ],
        },
        {
          id: "servers",
          label: "Servers",
          isLoading: showLoading,
          items:
            servers?.map((server) => ({
              id: server.id,
              label: server.name,
              isActive: location.pathname === `/${server.id}`,
              onClick: () => navigate(`/${server.id}`),
            })) || [],
        },
        {
          id: "actions",
          items: [
            {
              id: "new-server",
              label: "New server",
              icon: <PlusIcon />,
              isActive: location.pathname === "/new",
              onClick: () => navigate(`/new`),
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
            // {
            //   id: "settings",
            //   label: "Settings",
            //   icon: <GearIcon />,
            //   isActive: location.pathname === "/settings",
            //   onClick: () => navigate("/settings"),
            // },
          ],
        },
      ]}
    >
      <LayoutView>
        <Outlet />
      </LayoutView>
      <ChatToUs />
    </LayoutRoot>
  );
};

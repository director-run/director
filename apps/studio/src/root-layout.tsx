import "./fonts.css";
import "./globals.css";
import { ChatToUs } from "@director.run/design/components/chat-to-us.tsx";
import {
  LayoutRoot,
  LayoutView,
} from "@director.run/design/components/layout/layout.tsx";
import { MCPIcon } from "@director.run/design/components/ui/icons/mcp-icon.tsx";
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
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const showLoading = isLoading || error?.message === "Failed to fetch";
  const location = useLocation();

  return (
    <LayoutRoot
      sections={[
        {
          id: "registries",
          label: "Registries",
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
          id: "workspaces",
          label: "Workspaces",
          isLoading: showLoading,
          items:
            workspaces?.map((workspace) => ({
              id: workspace.id,
              label: workspace.name,
              isActive: location.pathname === `/${workspace.id}`,
              onClick: () => navigate(`/${workspace.id}`),
            })) || [],
        },
        {
          id: "actions",
          items: [
            {
              id: "new-workspace",
              label: "New Workspace",
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

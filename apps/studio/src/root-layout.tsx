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
import { GearIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useOnboardingProgress } from "./hooks/use-onboarding-progress";
import { usePlaybooks } from "./hooks/use-playbooks";

export const RootLayout = () => {
  const navigate = useNavigate();
  const { data: playbooks, isLoading, error } = usePlaybooks();
  const showLoading = isLoading || error?.message === "Failed to fetch";
  const location = useLocation();
  const { setInProgress } = useOnboardingProgress();

  // Unset onboarding flag when RootLayout renders
  useEffect(() => {
    setInProgress(false);
  }, [setInProgress]);

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
          id: "playbooks",
          label: "Playbooks",
          isLoading: showLoading,
          items:
            playbooks?.map((playbook) => ({
              id: playbook.id,
              label: playbook.name,
              isActive: location.pathname === `/${playbook.id}`,
              onClick: () => navigate(`/${playbook.id}`),
            })) || [],
        },
        {
          id: "actions",
          items: [
            {
              id: "new-playbook",
              label: "New Playbook",
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
            {
              id: "settings",
              label: "Settings",
              icon: <GearIcon />,
              isActive: location.pathname === "/settings",
              onClick: () => navigate("/settings"),
            },
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

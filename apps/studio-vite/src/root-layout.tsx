import "./fonts.css";
import "./globals.css";
import { ChatToUs } from "@director.run/studio/components/chat-to-us.tsx";
import {
  LayoutRoot,
  LayoutView,
} from "@director.run/studio/components/layout/layout.tsx";
import {
  BookOpenTextIcon,
  GithubLogoIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { trpc } from "./contexts/gateway-context";

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { data: servers, isLoading, error } = trpc.store.getAll.useQuery();
  const showLoading = isLoading || error?.message === "Failed to fetch";

  console.log("showLoading", showLoading);
  console.log("servers", servers);
  return (
    <LayoutRoot
      sections={[
        {
          id: "links",
          label: "Links",
          items: [
            {
              id: "settings",
              label: "Settings",
              isActive: false,
              onClick: () => navigate("/settings"),
            },
            {
              id: "about",
              label: "About",
              isActive: false,
              onClick: () => navigate("/about"),
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
              // isActive: server.id === proxyId,
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
              // isActive: pathname === "/new",
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
          ],
        },
      ]}
    >
      <LayoutView>{children}</LayoutView>
      <ChatToUs />
    </LayoutRoot>
  );
};

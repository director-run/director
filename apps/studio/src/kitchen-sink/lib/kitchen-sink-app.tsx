import { ChatToUs } from "@director.run/design/components/chat-to-us.tsx";
import {
  LayoutRoot,
  LayoutView,
} from "@director.run/design/components/layout/layout.tsx";
import type { NavigationSection } from "@director.run/design/components/layout/navigation.tsx";
import type {
  MCPTool,
  PlaybookDetail,
} from "@director.run/design/components/types.ts";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@director.run/design/components/ui/empty-state.tsx";
import { MCPIcon } from "@director.run/design/components/ui/icons/mcp-icon.tsx";
import { Toaster, toast } from "@director.run/design/components/ui/toast.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.js";
import {
  BookOpenTextIcon,
  GearIcon,
  GithubLogoIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { kitchenSinkConnectionInfo, kitchenSinkPlaybooks } from "./fixtures";
import { GetStartedRoute } from "./routes/get-started-route";
import { LibraryEntryRoute } from "./routes/library-entry-route";
import { LibraryRoute } from "./routes/library-route";
import { PlaybookDetailRoute } from "./routes/playbook-detail-route";
import { PlaybookNewRoute } from "./routes/playbook-new-route";
import { SettingsRoute } from "./routes/settings-route";
import { TargetDetailRoute } from "./routes/target-detail-route";
import type {
  KitchenSinkAppProps,
  KitchenSinkNavigate,
  KitchenSinkRoute,
} from "./types";

const tools = mockTools() as MCPTool[];

export function KitchenSinkApp({
  initialRoute,
  initialPlaybooks,
  sidebarLoading = false,
  pageState = "default",
}: KitchenSinkAppProps) {
  const [playbooks, setPlaybooks] = useState<PlaybookDetail[]>(
    () => initialPlaybooks ?? kitchenSinkPlaybooks(),
  );
  const [route, setRoute] = useState<KitchenSinkRoute>(
    () =>
      initialRoute ??
      (playbooks[0]
        ? { name: "playbook", playbookId: playbooks[0].id }
        : { name: "get-started" }),
  );

  const navigate: KitchenSinkNavigate = (next) => {
    setRoute(next);
  };

  const mutatePlaybook = (
    id: string,
    updater: (playbook: PlaybookDetail) => PlaybookDetail,
  ) => {
    setPlaybooks((list) =>
      list.map((playbook) =>
        playbook.id === id ? updater(playbook) : playbook,
      ),
    );
  };

  const deletePlaybook = (id: string) => {
    const remaining = playbooks.filter((playbook) => playbook.id !== id);
    setPlaybooks(remaining);
    if (remaining[0]) {
      navigate({ name: "playbook", playbookId: remaining[0].id });
    } else {
      navigate({ name: "get-started" });
    }
  };

  const createPlaybook = (values: { name: string; description?: string }) => {
    const id = values.name.trim().toLowerCase().replace(/\s+/g, "-") || "new";
    const created: PlaybookDetail = {
      id,
      name: values.name,
      description: values.description ?? "",
      userId: "kitchen-sink-user",
      prompts: [],
      servers: [],
      paths: { streamable: `/${id}/mcp` },
    };
    setPlaybooks((list) => [...list, created]);
    navigate({ name: "playbook", playbookId: id });
  };

  const sections: NavigationSection[] = [
    {
      id: "registries",
      label: "Registries",
      items: [
        {
          id: "mcp",
          label: "MCP",
          icon: <MCPIcon />,
          isActive: route.name === "library" || route.name === "library-entry",
          onClick: () => navigate({ name: "library" }),
        },
      ],
    },
    {
      id: "playbooks",
      label: "Playbooks",
      isLoading: sidebarLoading,
      items: playbooks.map((playbook) => ({
        id: playbook.id,
        label: playbook.name,
        isActive:
          (route.name === "playbook" && route.playbookId === playbook.id) ||
          (route.name === "target" && route.playbookId === playbook.id),
        onClick: () => navigate({ name: "playbook", playbookId: playbook.id }),
      })),
    },
    {
      id: "actions",
      items: [
        {
          id: "new-playbook",
          label: "New Playbook",
          icon: <PlusIcon />,
          isActive: route.name === "new-playbook",
          onClick: () => navigate({ name: "new-playbook" }),
        },
        {
          id: "documentation",
          label: "Documentation",
          icon: <BookOpenTextIcon weight="fill" />,
          onClick: () =>
            toast({
              title: "Documentation",
              description: "Would open https://docs.director.run",
            }),
        },
        {
          id: "github",
          label: "Github",
          icon: <GithubLogoIcon />,
          onClick: () =>
            toast({
              title: "GitHub",
              description: "Would open github.com/director-run/director",
            }),
        },
        {
          id: "settings",
          label: "Settings",
          icon: <GearIcon />,
          isActive: route.name === "settings",
          onClick: () => navigate({ name: "settings" }),
        },
      ],
    },
  ];

  if (route.name === "get-started") {
    return (
      <>
        <GetStartedRoute
          navigate={navigate}
          firstPlaybookId={playbooks[0]?.id}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <LayoutRoot sections={sections}>
        <LayoutView>{renderRoute()}</LayoutView>
        <ChatToUs />
      </LayoutRoot>
      <Toaster />
    </>
  );

  function renderRoute() {
    switch (route.name) {
      case "playbook": {
        const playbook = playbooks.find((p) => p.id === route.playbookId);
        if (!playbook) {
          return <RouteNotFound label="playbook" />;
        }
        return (
          <PlaybookDetailRoute
            playbook={playbook}
            tools={playbook.servers.length === 0 ? [] : tools}
            connectionInfo={kitchenSinkConnectionInfo(playbook.id)}
            navigate={navigate}
            pageState={pageState}
            onMutate={(updater) => mutatePlaybook(playbook.id, updater)}
            onDelete={() => deletePlaybook(playbook.id)}
          />
        );
      }
      case "target": {
        const playbook = playbooks.find((p) => p.id === route.playbookId);
        const target = playbook?.servers.find(
          (server) => server.name === route.targetId,
        );
        if (!playbook || !target) {
          return <RouteNotFound label="server" />;
        }
        return (
          <TargetDetailRoute
            playbook={playbook}
            target={target}
            tools={tools}
            navigate={navigate}
            pageState={pageState}
            onDelete={() => {
              mutatePlaybook(playbook.id, (current) => ({
                ...current,
                servers: current.servers.filter(
                  (server) => server.name !== target.name,
                ),
              }));
              navigate({ name: "playbook", playbookId: playbook.id });
            }}
          />
        );
      }
      case "library":
        return (
          <LibraryRoute
            playbooks={playbooks}
            navigate={navigate}
            pageState={pageState}
          />
        );
      case "library-entry":
        return (
          <LibraryEntryRoute
            entryName={route.entryName}
            playbooks={playbooks}
            navigate={navigate}
            pageState={pageState}
          />
        );
      case "new-playbook":
        return <PlaybookNewRoute onCreate={createPlaybook} />;
      case "settings":
        return <SettingsRoute pageState={pageState} />;
      default:
        return null;
    }
  }
}

function RouteNotFound({ label }: { label: string }) {
  return (
    <div className="grid grow place-items-center p-8">
      <EmptyState>
        <EmptyStateTitle>Not found</EmptyStateTitle>
        <EmptyStateDescription>
          The requested {label} does not exist.
        </EmptyStateDescription>
      </EmptyState>
    </div>
  );
}

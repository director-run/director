import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.tsx";
import { ProxySkeleton } from "@director.run/studio/components/proxies/proxy-skeleton.tsx";
import { WorkspaceSectionClients } from "@director.run/studio/components/proxies/workspace-section-clients.tsx";
import { WorkspaceSectionHeader } from "@director.run/studio/components/proxies/workspace-section-header.tsx";
import { WorkspaceSectionServers } from "@director.run/studio/components/proxies/workspace-section-servers.tsx";
import { WorkspaceSectionTools } from "@director.run/studio/components/proxies/workspace-section-tools.tsx";
import { ConfiguratorTarget } from "@director.run/studio/components/types.ts";
import { Container } from "@director.run/studio/components/ui/container.tsx";
import { SectionSeparator } from "@director.run/studio/components/ui/section.tsx";
import { toast } from "@director.run/studio/components/ui/toast.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { GATEWAY_URL } from "../config";
import { useChangeInstallState } from "../hooks/use-change-install-state";
import { useClients } from "../hooks/use-clients";
import { useInspectMcp } from "../hooks/use-inspect-mcp";
import { useWorkspace } from "../hooks/use-workspace";

export const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }

  const { workspace, isLoading } = useWorkspace(workspaceId);

  const { data: clients, isLoading: isClientsLoading } =
    useClients(workspaceId);
  const { changeInstallState, isPending } = useChangeInstallState(workspaceId, {
    onSuccess: (_client, install) => {
      toast({
        title: install ? "Proxy installed" : "Proxy uninstalled",
        description: install
          ? "This proxy was successfully installed"
          : "This proxy was successfully uninstalled",
      });
    },
    onError: (_client, install) => {
      toast({
        title: "Error",
        description: install
          ? "Failed to install this proxy"
          : "Failed to uninstall this proxy",
      });
    },
  });

  const { tools, isLoading: toolsLoading } = useInspectMcp(workspaceId);

  if (isLoading) {
    return <ProxySkeleton />;
  }

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  return (
    <>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Workspaces",
          },
          {
            title: workspaceId,
          },
        ]}
      />

      <LayoutViewContent>
        <Container size="lg">
          <WorkspaceSectionHeader workspace={workspace} />
          <SectionSeparator />
          <WorkspaceSectionClients
            workspace={workspace}
            gatewayBaseUrl={GATEWAY_URL}
            clients={clients ?? []}
            isClientsLoading={isClientsLoading}
            onChangeInstall={async (
              client: ConfiguratorTarget,
              install: boolean,
            ) => {
              await changeInstallState(client, install);
            }}
            isChanging={isPending}
          />
          <SectionSeparator />
          <WorkspaceSectionServers
            workspace={workspace}
            onLibraryClick={() => navigate("/library")}
            onServerClick={(serverId) =>
              navigate(`/${workspaceId}/${serverId}`)
            }
          />
          <SectionSeparator />
          <WorkspaceSectionTools
            tools={tools}
            toolsLoading={toolsLoading}
            onToolClick={(tool) => setSelectedTool(tool)}
          />
        </Container>
      </LayoutViewContent>
    </>
  );
};

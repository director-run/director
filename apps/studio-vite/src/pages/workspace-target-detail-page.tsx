import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.tsx";
import { LayoutView } from "@director.run/studio/components/layout/layout.tsx";
import { McpLogo } from "@director.run/studio/components/mcp-logo.tsx";
import { McpDescriptionList } from "@director.run/studio/components/mcp-servers/mcp-description-list.tsx";
import { WorkspaceSectionTools } from "@director.run/studio/components/proxies/workspace-section-tools.tsx";
import { WorkspaceTargetDetailDropDownMenu } from "@director.run/studio/components/proxies/workspace-target-detail-dropdown-menu.tsx";
import { Container } from "@director.run/studio/components/ui/container.tsx";
import { EmptyState } from "@director.run/studio/components/ui/empty-state.tsx";
import { EmptyStateTitle } from "@director.run/studio/components/ui/empty-state.tsx";
import { Markdown } from "@director.run/studio/components/ui/markdown.tsx";
import { Section } from "@director.run/studio/components/ui/section.tsx";
import { SectionHeader } from "@director.run/studio/components/ui/section.tsx";
import { SectionTitle } from "@director.run/studio/components/ui/section.tsx";
import { SectionDescription } from "@director.run/studio/components/ui/section.tsx";
import { toast } from "@director.run/studio/components/ui/toast.tsx";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { gatewayClient, registryClient } from "../contexts/backend-context.tsx";
import { useInspectMcp } from "../hooks/use-inspect-mcp.ts";
import { useWorkspace } from "../hooks/use-workspace.ts";

export function WorkspaceTargetDetailPage() {
  const { workspaceId, targetId } = useParams();
  const navigate = useNavigate();

  if (!workspaceId || !targetId) {
    throw new Error("Workspace ID and target ID are required");
  }

  const [deleteOpen, setDeleteOpen] = useState(false);
  const { workspace, isLoading } = useWorkspace(workspaceId);

  const workspaceTarget = workspace?.servers.find(
    (server) => server.name === targetId,
  );

  if (!workspaceTarget) {
    throw new Error("Workspace target not found");
  }

  const { tools, isLoading: toolsLoading } = useInspectMcp(
    workspaceId,
    targetId,
  );

  const registryEntryQuery = registryClient.entries.getEntryByName.useQuery(
    {
      name: targetId,
    },
    {
      throwOnError: false,
    },
  );

  const utils = gatewayClient.useUtils();

  const registryEntry = registryEntryQuery.data;

  const deleteServerMutation = gatewayClient.store.removeServer.useMutation({
    onSuccess: async () => {
      navigate(`/${workspaceId}`);

      await utils.store.get.invalidate({ proxyId: workspaceId });
      await utils.store.getAll.invalidate();

      toast({
        title: "Server deleted",
        description: "This server was successfully deleted.",
      });
    },
  });

  const handleDeleteServer = async () => {
    await deleteServerMutation.mutateAsync({
      proxyId: workspaceId,
      serverName: targetId,
    });
  };

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: workspace?.name || "",
            onClick: () => navigate(`/${workspaceId}`),
          },
          {
            title: workspaceTarget?.name,
          },
        ]}
      >
        <WorkspaceTargetDetailDropDownMenu
          onDelete={handleDeleteServer}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="lg">
          <Section>
            <McpLogo src={registryEntry?.icon} className="size-9" />
            <SectionHeader>
              <SectionTitle>{workspaceTarget.name}</SectionTitle>
              <SectionDescription>
                Installed on{" "}
                <button
                  onClick={() => navigate(`/${workspaceId}`)}
                  className="cursor-pointer text-fg underline"
                >
                  {workspace?.name}
                </button>
              </SectionDescription>
            </SectionHeader>

            {registryEntry?.description ? (
              <Markdown>{registryEntry?.description}</Markdown>
            ) : null}
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Transport</h3>
              </SectionTitle>
            </SectionHeader>

            <McpDescriptionList transport={workspaceTarget.transport} />
          </Section>

          <WorkspaceSectionTools
            tools={tools}
            toolsLoading={toolsLoading}
            onToolClick={(tool) => console.log(tool)}
          />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Readme</h3>
              </SectionTitle>
            </SectionHeader>
            {registryEntry?.readme ? (
              <div className="rounded-md border-[0.5px] bg-accent-subtle/20 px-4 py-8">
                <Markdown className="mx-auto">{registryEntry?.readme}</Markdown>
              </div>
            ) : (
              <EmptyState>
                <EmptyStateTitle>No readme found</EmptyStateTitle>
              </EmptyState>
            )}
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}

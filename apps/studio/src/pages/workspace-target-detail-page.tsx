import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { LayoutView } from "@director.run/design/components/layout/layout.tsx";
import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import { WorkspaceTargetPropertyList } from "@director.run/design/components/mcp-servers/workspace-target-property-list.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { ProxySkeleton } from "@director.run/design/components/proxies/proxy-skeleton.tsx";
import { WorkspaceSectionTools } from "@director.run/design/components/proxies/workspace-section-tools.tsx";
import { WorkspaceTargetDetailDropDownMenu } from "@director.run/design/components/proxies/workspace-target-detail-dropdown-menu.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { EmptyState } from "@director.run/design/components/ui/empty-state.tsx";
import { EmptyStateTitle } from "@director.run/design/components/ui/empty-state.tsx";
import { Markdown } from "@director.run/design/components/ui/markdown.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { gatewayClient } from "../contexts/backend-context.tsx";
import { useInspectMcp } from "../hooks/use-inspect-mcp.ts";
import { useRegistryEntry } from "../hooks/use-registry-entry.ts";
import { useWorkspaceTarget } from "../hooks/use-workspace-target.ts";

export function WorkspaceTargetDetailPage() {
  const { workspaceId, targetId } = useParams();
  const navigate = useNavigate();

  if (!workspaceId || !targetId) {
    throw new Error("Workspace ID and target ID are required");
  }

  const [deleteOpen, setDeleteOpen] = useState(false);
  const {
    workspace,
    workspaceTarget,
    isWorkspaceTargetLoading,
    workspaceTargetError,
  } = useWorkspaceTarget(workspaceId, targetId);

  const { tools, isLoading: toolsLoading } = useInspectMcp(
    workspaceId,
    targetId,
  );

  const registryEntryQuery = useRegistryEntry({ entryName: targetId });

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

  if (isWorkspaceTargetLoading) {
    return <ProxySkeleton />;
  }

  if (workspaceTargetError || !workspaceTarget) {
    return (
      <FullScreenError
        icon="dead-smiley"
        fullScreen={true}
        title={"Unexpected Error"}
        subtitle={workspaceTargetError?.toString() || "Unknown error"}
      />
    );
  }

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

            <WorkspaceTargetPropertyList target={workspaceTarget} />
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

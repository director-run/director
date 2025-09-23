"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutView,
  LayoutViewContent,
} from "../../../../../components/layout/layout";
import { LayoutBreadcrumbHeader } from "../../../../../components/layout/layout-breadcrumb-header";
import { McpLogo } from "../../../../../components/mcp-logo";
import { McpDescriptionList } from "../../../../../components/mcp-servers/mcp-description-list";
import { ProxySkeleton } from "../../../../../components/proxies/proxy-skeleton";
import { WorkspaceSectionTools } from "../../../../../components/proxies/workspace-section-tools";
import { WorkspaceTargetDetailDropDownMenu } from "../../../../../components/proxies/workspace-target-detail-dropdown-menu";
import type { RegistryEntryDetail } from "../../../../../components/types";
import { Container } from "../../../../../components/ui/container";
import {
  EmptyState,
  EmptyStateTitle,
} from "../../../../../components/ui/empty-state";
import { Markdown } from "../../../../../components/ui/markdown";
import { Section } from "../../../../../components/ui/section";
import { SectionHeader } from "../../../../../components/ui/section";
import { SectionTitle } from "../../../../../components/ui/section";
import { SectionDescription } from "../../../../../components/ui/section";
import { toast } from "../../../../../components/ui/toast";
import { trpc } from "../../../../../state/client";
import { useInspectMcp } from "../../../../../state/use-inspect-mcp";
import { useProxy } from "../../../../../state/use-proxy";

export default function McpServerPage() {
  const router = useRouter();
  const params = useParams<{ proxyId: string; mcpId: string }>();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { proxy: workspace, isLoading } = useProxy(params.proxyId);

  const { tools, isLoading: toolsLoading } = useInspectMcp(
    params.proxyId,
    undefined,
  );

  const registryEntryQuery = trpc.registry.getEntryByName.useQuery(
    {
      name: params.mcpId,
    },
    {
      throwOnError: false,
    },
  );

  const utils = trpc.useUtils();

  const deleteServerMutation = trpc.store.removeServer.useMutation({
    onSuccess: async () => {
      await utils.store.get.invalidate({ proxyId: params.proxyId });
      await utils.store.getAll.invalidate();

      toast({
        title: "Server deleted",
        description: "This server was successfully deleted.",
      });
      setDeleteOpen(false);
      router.push(`/${params.proxyId}`);
    },
  });

  const workspaceTarget = workspace?.servers.find(
    (server) => server.name === params.mcpId,
  );

  const handleDeleteServer = async () => {
    await deleteServerMutation.mutateAsync({
      proxyId: params.proxyId,
      serverName: params.mcpId,
    });
  };

  useEffect(() => {
    if (!isLoading && (!workspace || !workspaceTarget)) {
      toast({
        title: "MCP server not found",
        description: "The MCP server you are looking for does not exist.",
      });

      if (!workspace) {
        router.push("/");
      }

      if (!workspaceTarget) {
        router.push(`/${params.proxyId}`);
      }
    }
  }, [workspace, isLoading]);

  if (
    isLoading ||
    registryEntryQuery.isLoading ||
    !workspace ||
    !workspaceTarget
  ) {
    return <ProxySkeleton />;
  }

  const registryEntry: RegistryEntryDetail | undefined =
    registryEntryQuery.data ?? undefined;
  const description = registryEntry?.description;

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: workspace?.name || "",
            onClick: () => router.push(`/${workspace.id}`),
          },
          {
            title: workspaceTarget.name,
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
                  onClick={() => router.push(`/${workspace.id}`)}
                  className="cursor-pointer text-fg underline"
                >
                  {workspace?.name}
                </button>
              </SectionDescription>
            </SectionHeader>

            {description ? <Markdown>{description}</Markdown> : null}
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

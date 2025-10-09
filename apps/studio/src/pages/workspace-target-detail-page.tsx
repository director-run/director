import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { LayoutView } from "@director.run/design/components/layout/layout.tsx";
import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import { WorkspaceTargetPropertyList } from "@director.run/design/components/mcp-servers/workspace-target-property-list.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { ProxySkeleton } from "@director.run/design/components/proxies/proxy-skeleton.tsx";
import { RegistryEntryReadme } from "@director.run/design/components/registry/registry-entry-readme.tsx";
import { ToolList } from "@director.run/design/components/tools/tool-list.js";
import type { MCPTool } from "@director.run/design/components/types.js";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { Markdown } from "@director.run/design/components/ui/markdown.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import {
  BookOpenTextIcon,
  HardDriveIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useListTools } from "../hooks/use-list-tools.ts";
import { useRegistryEntry } from "../hooks/use-registry-entry.ts";
import { useWorkspaceTarget } from "../hooks/use-workspace-target.ts";
import { WorkspaceTargetDetailDropDownMenu } from "./workspace-target-detail-dropdown-menu.tsx";

export function WorkspaceTargetDetailPage() {
  const { workspaceId, targetId } = useParams();
  const navigate = useNavigate();

  if (!workspaceId || !targetId) {
    throw new Error("Workspace ID and target ID are required");
  }

  const {
    workspace,
    workspaceTarget,
    isWorkspaceTargetLoading,
    workspaceTargetError,
  } = useWorkspaceTarget(workspaceId, targetId);

  const { tools, isToolsLoading } = useListTools(workspaceId, targetId);
  const registryEntryQuery = useRegistryEntry({ entryName: targetId });
  const registryEntry = registryEntryQuery.data;

  if (isWorkspaceTargetLoading) {
    return <ProxySkeleton />;
  }

  if (workspaceTargetError || !workspaceTarget || !workspace) {
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
          workspaceTarget={workspaceTarget}
          workspace={workspace}
        />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="lg">
          <Section className="gap-y-8">
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

          <Tabs default="tools">
            <Tab
              id="readme"
              label="Readme"
              icon={<BookOpenTextIcon />}
              content={
                <RegistryEntryReadme readme={registryEntry?.readme ?? null} />
              }
            />
            <Tab
              id="tools"
              label="Tools"
              icon={<ToolboxIcon />}
              content={
                <ToolList
                  tools={tools as MCPTool[]}
                  toolsLoading={isToolsLoading}
                />
              }
            />
            <Tab
              id="properties"
              label="Properties"
              icon={<HardDriveIcon />}
              content={
                <Section>
                  <SectionHeader>
                    <SectionTitle variant="h2" asChild>
                      <h3>Transport Configuration</h3>
                    </SectionTitle>
                  </SectionHeader>
                  <WorkspaceTargetPropertyList target={workspaceTarget} />
                </Section>
              }
            />
          </Tabs>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}

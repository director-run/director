import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import { WorkspaceTargetPropertyList } from "@director.run/design/components/mcp-servers/workspace-target-property-list.tsx";
import { ToolsList } from "@director.run/design/components/tools/tool-list.js";
import type {
  MCPTool,
  RegistryEntryDetail,
  WorkspaceTarget,
} from "@director.run/design/components/types.js";
import type { WorkspaceDetail } from "@director.run/design/components/types.js";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { EmptyState } from "@director.run/design/components/ui/empty-state.tsx";
import { EmptyStateTitle } from "@director.run/design/components/ui/empty-state.tsx";
import { Markdown } from "@director.run/design/components/ui/markdown.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";

export function WorkspaceTargetDetailContent({
  workspaceTarget,
  workspace,
  registryEntry,
  navigate,
  workspaceId,
  tools,
  toolsLoading,
}: WorkspaceTargetDetailContentProps) {
  return (
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

      <ToolsList tools={tools as MCPTool[]} toolsLoading={toolsLoading} />

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
  );
}

type WorkspaceTargetDetailContentProps = {
  workspaceTarget: WorkspaceTarget;
  workspace: WorkspaceDetail;
  registryEntry?: RegistryEntryDetail;
  navigate: (path: string) => void;
  workspaceId: string;
  tools: MCPTool[];
  toolsLoading: boolean;
};

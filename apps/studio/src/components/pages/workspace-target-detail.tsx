import { McpLogo } from "../mcp-logo";
import { McpDescriptionList } from "../mcp-servers/mcp-description-list";
import { McpToolsTable } from "../mcp-servers/mcp-tools-table";
import type { MasterRegistryEntry } from "../types";
import type { MasterWorkspace, MasterWorkspaceTarget } from "../types";
import { Container } from "../ui/container";
import { EmptyState, EmptyStateTitle } from "../ui/empty-state";
import { Markdown } from "../ui/markdown";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";

interface WorkspaceTargetDetailProps {
  workspaceTarget: MasterWorkspaceTarget;
  workspace: MasterWorkspace;
  entryData: Pick<MasterRegistryEntry, "icon" | "readme">;
  description?: string | null;
  toolLinks: Array<{
    title: string;
    subtitle: string;
    scroll: boolean;
    href: string;
    badges?: React.ReactNode;
  }>;
  toolsLoading: boolean;
  onProxyClick?: (proxyId: string) => void;
}

export function WorkspaceTargetDetail({
  workspaceTarget,
  workspace,
  entryData,
  description,
  toolLinks,
  toolsLoading,
  onProxyClick,
}: WorkspaceTargetDetailProps) {
  return (
    <Container size="lg">
      <Section>
        <McpLogo src={entryData?.icon} className="size-9" />
        <SectionHeader>
          <SectionTitle>{workspaceTarget.name}</SectionTitle>
          <SectionDescription>
            Installed on{" "}
            <button
              onClick={() => onProxyClick?.(workspace.id)}
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

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>Tools</h3>
          </SectionTitle>
        </SectionHeader>

        <McpToolsTable links={toolLinks} isLoading={toolsLoading} />
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>Readme</h3>
          </SectionTitle>
        </SectionHeader>
        {entryData.readme ? (
          <div className="rounded-md border-[0.5px] bg-accent-subtle/20 px-4 py-8">
            <Markdown className="mx-auto">{entryData.readme}</Markdown>
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

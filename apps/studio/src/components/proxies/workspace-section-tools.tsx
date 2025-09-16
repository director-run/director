import { McpToolsTable } from "../mcp-servers/mcp-tools-table";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

export interface WorkspaceSectionToolsProps {
  toolLinks: Array<{
    title: string;
    subtitle: string;
    scroll: boolean;
    href: string;
    badges?: React.ReactNode;
  }>;
  toolsLoading: boolean;
}

export function WorkspaceSectionTools({
  toolLinks,
  toolsLoading,
}: WorkspaceSectionToolsProps) {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle variant="h2" asChild>
          <h2>Tools</h2>
        </SectionTitle>
      </SectionHeader>
      <McpToolsTable links={toolLinks} isLoading={toolsLoading} />
    </Section>
  );
}

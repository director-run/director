import type { Tool as McpSdkTool } from "@modelcontextprotocol/sdk/types.js";
import { McpToolsTable } from "../mcp-servers/mcp-tools-table";
import { Badge, BadgeLabel } from "../ui/badge";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

export interface WorkspaceSectionToolsProps {
  tools: McpSdkTool[];
  toolsLoading: boolean;
  onToolClick: (tool: McpSdkTool) => void | Promise<void>;
}

export function WorkspaceSectionTools({
  tools,
  toolsLoading,
  onToolClick,
}: WorkspaceSectionToolsProps) {
  const toolLinks = tools
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((tool) => {
      const server = tool.description?.match(/\[([^\]]+)\]/)?.[1];
      return {
        title: tool.name,
        subtitle: tool.description?.replace(/\[([^\]]+)\]/g, "") || "",
        scroll: false,
        href: `#`,
        onClick: () => onToolClick(tool),
        badges: server && (
          <Badge>
            <BadgeLabel uppercase>{server}</BadgeLabel>
          </Badge>
        ),
      };
    });

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

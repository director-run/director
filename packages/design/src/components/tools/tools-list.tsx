import { useState } from "react";
import { ListOfLinks } from "../list-of-links";
import { RegistryToolSheet } from "../registry/registry-tool-sheet";
import type { MCPTool } from "../types";
import { Badge, BadgeLabel } from "../ui/badge";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

export function ToolsList({ tools, toolsLoading }: WorkspaceSectionToolsProps) {
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);

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
        onClick: () => setSelectedTool(tool),
        badges: server && (
          <Badge>
            <BadgeLabel uppercase>{server}</BadgeLabel>
          </Badge>
        ),
      };
    });

  return (
    <>
      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h2>Tools</h2>
          </SectionTitle>
        </SectionHeader>
        <ListOfLinks isLoading={toolsLoading} links={toolLinks} />
      </Section>
      {selectedTool && (
        <RegistryToolSheet
          tool={selectedTool as MCPTool}
          mcpName={"XXXXXXXXXXX"}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </>
  );
}

interface WorkspaceSectionToolsProps {
  tools: MCPTool[];
  toolsLoading: boolean;
}

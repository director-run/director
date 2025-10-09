import { XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ListOfLinks } from "../list-of-links";
import type { MCPTool } from "../types";
import { Badge, BadgeLabel } from "../ui/badge";
import { Button } from "../ui/button";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import { ToolSheet } from "./tool-sheet";

export function ToolList({ tools, toolsLoading, editable }: ToolListProps) {
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [editing, setEditing] = useState(false);

  const toolLinks = (tools || []).slice().map((tool) => {
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
        <SectionHeader className="flex flex-row items-center justify-between">
          <SectionTitle variant="h2" className="flex-1" asChild>
            <h2>Tools</h2>
          </SectionTitle>

          {editable && !editing && (
            <Button size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          {editing && (
            <>
              <Button size="sm" onClick={() => setEditing(false)}>
                Save
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditing(false)}
              >
                <XIcon weight="bold" />
              </Button>
            </>
          )}
        </SectionHeader>
        <ListOfLinks isLoading={toolsLoading} links={toolLinks} />
      </Section>
      {selectedTool && (
        <ToolSheet
          tool={selectedTool as MCPTool}
          mcpName={"XXXXXXXXXXX"}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </>
  );
}

interface ToolListProps {
  tools: MCPTool[];
  toolsLoading: boolean;
  editable?: boolean;
  onUpdateTools?: (
    tools: Pick<MCPTool, "name" | "disabled" | "serverName">[],
  ) => void;
}

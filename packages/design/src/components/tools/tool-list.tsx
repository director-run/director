import { XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { ListSkeleton } from "../loaders/list-skeleton";
import type { MCPTool } from "../types";
import { Badge, BadgeLabel } from "../ui/badge";
import { BadgeGroup } from "../ui/badge";
import { Button } from "../ui/button";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "../ui/empty-state";
import * as List from "../ui/list";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import { ToolSheet } from "./tool-sheet";

export function ToolList({ tools, toolsLoading, editable }: ToolListProps) {
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [editing, setEditing] = useState(false);

  if (toolsLoading) {
    return <LoadingToolList />;
  }

  if (tools.length === 0) {
    return <EmptyToolList />;
  }

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

        <List.List>
          {tools.map((tool) => (
            <ToolListItem
              key={`li-${tool.name}`}
              tool={tool}
              onClick={() => setSelectedTool(tool)}
            />
          ))}
        </List.List>
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

function ToolListItem({
  tool,
  onClick,
}: { tool: MCPTool; onClick: () => void }) {
  const subtitle = tool.description?.replace(/\[([^\]]+)\]/g, "") || "";

  return (
    <List.ListItem onClick={onClick}>
      <List.ListItemDetails>
        <List.ListItemTitle>{tool.name}</List.ListItemTitle>
        {subtitle && (
          <List.ListItemDescription>{subtitle}</List.ListItemDescription>
        )}
      </List.ListItemDetails>

      {tool.disabled && (
        <BadgeGroup className="ml-auto">
          <Badge>
            <BadgeLabel uppercase>Disabled</BadgeLabel>
          </Badge>
        </BadgeGroup>
      )}
    </List.ListItem>
  );
}

export function EmptyToolList() {
  return (
    <>
      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" className="flex-1" asChild>
            <h2>Tools</h2>
          </SectionTitle>
        </SectionHeader>

        <EmptyState>
          <EmptyStateTitle>No items</EmptyStateTitle>
          <EmptyStateDescription>This list is empty.</EmptyStateDescription>
        </EmptyState>
      </Section>
    </>
  );
}

export function LoadingToolList() {
  return (
    <>
      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" className="flex-1" asChild>
            <h2>Tools</h2>
          </SectionTitle>
        </SectionHeader>

        <ListSkeleton />
      </Section>
    </>
  );
}

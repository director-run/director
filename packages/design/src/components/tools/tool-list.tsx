import { XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { ReactNode } from "react";
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

  if (toolsLoading) {
    return <LoadingToolList />;
  }

  if (toolLinks.length === 0) {
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
          {toolLinks.map((it) => (
            <ListItem key={`li-${it.title}`} link={it} />
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

interface LinkItem {
  href: string;
  scroll?: boolean;
  subtitle?: string;
  title: string;
  badges?: ReactNode;
  onClick?: () => void;
}

function ListItem({ link }: { link: LinkItem }) {
  return (
    <List.ListItem onClick={link.onClick}>
      <List.ListItemDetails>
        <List.ListItemTitle>{link.title}</List.ListItemTitle>
        {link.subtitle && (
          <List.ListItemDescription>{link.subtitle}</List.ListItemDescription>
        )}
      </List.ListItemDetails>

      {link.badges && (
        <BadgeGroup className="ml-auto">{link.badges}</BadgeGroup>
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

import { XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useEffect } from "react";
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
import { ScrambleText } from "../ui/scramble-text";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import { Switch } from "../ui/switch";
import { ToolSheet } from "./tool-sheet";

type ToolUpdateAttribs = {
  name: string;
  disabled: boolean;
  serverName: string;
};

export function ToolList({
  tools,
  toolsLoading,
  editable,
  isSaving,
  onUpdateTools,
}: ToolListProps) {
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTools, setDraftTools] = useState<ToolUpdateAttribs[]>([]);

  useEffect(() => {
    if (isEditing) {
      return;
    }
    setDraftTools(
      (tools ?? []).map((t) => ({
        name: t.name,
        disabled: !!t.disabled,
        serverName: t.serverName ?? "",
      })),
    );
  }, [tools, isEditing]);

  // Check if all tools are enabled (not disabled)
  const allToolsEnabled =
    draftTools.length > 0 && draftTools.every((tool) => !tool.disabled);

  // Handle global toggle
  const handleGlobalToggle = (enabled: boolean) => {
    setDraftTools(
      draftTools.map((tool) => ({
        ...tool,
        disabled: !enabled,
      })),
    );
  };

  if (toolsLoading) {
    return <LoadingToolList />;
  }

  if (!tools || tools.length === 0) {
    return <EmptyToolList />;
  }

  return (
    <>
      <Section>
        <SectionHeader className="flex flex-row items-center justify-between">
          <SectionTitle variant="h2" className="flex-1" asChild>
            <h2>Tools</h2>
          </SectionTitle>

          {editable && !isEditing && (
            <Button
              size="sm"
              onClick={() => {
                setDraftTools(
                  tools.map((t) => ({
                    name: t.name,
                    disabled: !!t.disabled,
                    serverName: t.serverName ?? "",
                  })),
                );
                setIsEditing(true);
              }}
            >
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                disabled={isSaving}
                onClick={async () => {
                  if (draftTools) {
                    await onUpdateTools?.(draftTools);
                  }
                  setIsEditing(false);
                  setDraftTools([]);
                }}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={isSaving}
                onClick={() => {
                  setIsEditing(false);
                  setDraftTools([]);
                }}
              >
                <XIcon weight="bold" />
              </Button>
              <div className="flex items-center gap-2">
                <Switch
                  id="global-toggle"
                  checked={allToolsEnabled}
                  onCheckedChange={handleGlobalToggle}
                />
              </div>
            </div>
          )}
        </SectionHeader>

        <List.List>
          {tools.map((tool) => (
            <ToolListItem
              key={`li-${tool.serverName}:${tool.name}`}
              tool={tool}
              onClick={() => setSelectedTool(tool)}
              draftTool={draftTools.find(
                (t) => t.name === tool.name && t.serverName === tool.serverName,
              )}
              isEditing={isEditing}
              isSaving={isSaving}
              onDisabledChange={(tool, disabled) => {
                setDraftTools(
                  draftTools.map((t) => {
                    if (
                      t.name === tool.name &&
                      t.serverName === tool.serverName
                    ) {
                      return { ...t, disabled };
                    }
                    return t;
                  }),
                );
              }}
            />
          ))}
        </List.List>
      </Section>
      {selectedTool && (
        <ToolSheet
          tool={selectedTool}
          mcpName={"XXXXXXXXXXX"}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </>
  );
}

interface ToolListProps {
  tools?: MCPTool[];
  toolsLoading: boolean;
  editable?: boolean;
  isSaving?: boolean;
  onUpdateTools?: (tools: ToolUpdateAttribs[]) => void | Promise<void>;
}

function ToolListItem({
  tool,
  draftTool,
  onClick,
  isEditing,
  isSaving,
  onDisabledChange,
}: {
  tool: MCPTool;
  draftTool?: ToolUpdateAttribs;
  onClick: () => void;
  isEditing: boolean;
  isSaving?: boolean;
  onDisabledChange: (tool: MCPTool, disabled: boolean) => void;
}) {
  const subtitle = tool.description?.replace(/\[([^\]]+)\]/g, "") || "";

  return (
    <List.ListItem onClick={!isEditing ? onClick : undefined}>
      <List.ListItemDetails>
        <List.ListItemTitle>{tool.name}</List.ListItemTitle>
        {subtitle && (
          <List.ListItemDescription>{subtitle}</List.ListItemDescription>
        )}
      </List.ListItemDetails>

      {draftTool?.disabled && !isEditing && (
        <BadgeGroup className="ml-auto">
          <Badge>
            <BadgeLabel uppercase>Disabled</BadgeLabel>
          </Badge>
        </BadgeGroup>
      )}
      {isEditing && (
        <ToolSwitch
          id={tool.name}
          checked={!draftTool?.disabled}
          loading={isSaving ?? false}
          onCheckedChange={(checked) => {
            onDisabledChange(tool, !checked);
          }}
        />
      )}
    </List.ListItem>
  );
}

function ToolSwitch({
  id,
  checked,
  loading,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  loading: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  if (loading) {
    return (
      <BadgeGroup>
        <Badge>
          <BadgeLabel>
            <ScrambleText text="Loading" />
          </BadgeLabel>
        </Badge>
      </BadgeGroup>
    );
  } else {
    return (
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    );
  }
}

function EmptyToolList() {
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

function LoadingToolList() {
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

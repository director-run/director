import type { ComponentProps } from "react";
import type { WorkspaceDetail } from "../types";
import { Button } from "../ui/button";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "../ui/empty-state";
import * as List from "../ui/list";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

type Prompt = NonNullable<WorkspaceDetail["prompts"]>[number];

export interface PromptListProps extends ComponentProps<typeof Section> {
  prompts?: Prompt[];
  onClickPrompt?: (prompt: Prompt) => void;
  onClickAddPrompt?: () => void;
}

export function PromptList({
  prompts,
  onClickPrompt,
  onClickAddPrompt,
  ...props
}: PromptListProps) {
  const list = prompts ?? [];

  return (
    <Section {...props}>
      <SectionHeader className="flex flex-row items-center justify-between">
        <SectionTitle variant="h2" asChild>
          <h2>Prompts</h2>
        </SectionTitle>
        <Button size="sm" onClick={onClickAddPrompt}>
          Add prompt
        </Button>
      </SectionHeader>

      {list.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No prompts</EmptyStateTitle>
          <EmptyStateDescription>
            Create your first prompt to reuse instructions across tools.
          </EmptyStateDescription>
        </EmptyState>
      ) : (
        <List.List>
          {list.map((prompt) => (
            <PromptListItem
              key={`prompt-${prompt.name}`}
              prompt={prompt}
              onClick={onClickPrompt && (() => onClickPrompt(prompt))}
            />
          ))}
        </List.List>
      )}
    </Section>
  );
}

function PromptListItem({
  prompt,
  onClick,
}: {
  prompt: Prompt;
  onClick?: () => void;
}) {
  return (
    <List.ListItem onClick={onClick}>
      <List.ListItemDetails>
        <List.ListItemTitle>{prompt.title ?? prompt.name}</List.ListItemTitle>
        <List.ListItemDescription>
          {prompt.description || prompt.body}
        </List.ListItemDescription>
      </List.ListItemDetails>
    </List.ListItem>
  );
}

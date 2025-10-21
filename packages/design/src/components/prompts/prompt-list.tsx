import type { ComponentProps } from "react";
import { useState } from "react";
import type { PlaybookDetail } from "../types";
import { Button } from "../ui/button";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "../ui/empty-state";
import * as List from "../ui/list";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import { PromptSheet } from "./prompt-sheet";

type Prompt = NonNullable<PlaybookDetail["prompts"]>[number];

export interface PromptListProps extends ComponentProps<typeof Section> {
  prompts?: Prompt[];
  onCreatePrompt?: (values: {
    title: string;
    description?: string;
    body: string;
  }) => Promise<void> | void;
  onEditPrompt?: (
    promptName: string,
    values: { title?: string; description?: string; body?: string },
  ) => Promise<void> | void;
  onDeletePrompt?: (promptName: string) => Promise<void> | void;
  isSavingPrompt?: boolean;
}

export function PromptList({
  prompts,
  onCreatePrompt,
  onEditPrompt,
  onDeletePrompt,
  isSavingPrompt = false,
  ...props
}: PromptListProps) {
  const list = prompts ?? [];
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Prompt | null>(null);

  return (
    <>
      <Section {...props}>
        <SectionHeader className="flex flex-row items-center justify-between">
          <SectionTitle variant="h2" asChild>
            <h2>Prompts</h2>
          </SectionTitle>
          <Button
            size="sm"
            onClick={() => {
              setSelected(null);
              setOpen(true);
            }}
          >
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
                onClick={() => {
                  setSelected(prompt);
                  setOpen(true);
                }}
              />
            ))}
          </List.List>
        )}
      </Section>

      <PromptSheet
        open={open}
        onOpenChange={setOpen}
        prompt={selected}
        isSubmitting={isSavingPrompt}
        onClickDelete={
          selected
            ? async () => {
                await onDeletePrompt?.(selected.name);
                setOpen(false);
              }
            : undefined
        }
        onSubmit={async (values) => {
          if (selected && onEditPrompt) {
            await onEditPrompt(selected.name, values);
            setOpen(false);
            return;
          }
          if (onCreatePrompt) {
            await onCreatePrompt(values);
            setOpen(false);
          }
        }}
      />
    </>
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

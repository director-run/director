"use client";
import { useState } from "react";
import type { PlaybookDetail } from "../types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { SectionSeparator } from "../ui/section";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { PromptForm, type PromptFormData } from "./prompt-form";

type Prompt = NonNullable<PlaybookDetail["prompts"]>[number];

export interface PromptSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: Prompt | null;
  onSubmit: (data: PromptFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  onClickDelete?: () => Promise<void> | void;
}

export function PromptSheet({
  open,
  onOpenChange,
  prompt,
  onSubmit,
  isSubmitting = false,
  onClickDelete,
}: PromptSheetProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  const handleDelete = () => {
    setDeleteOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent>
          <SheetActions>
            <Breadcrumb className="grow">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Prompts</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {prompt ? "Edit" : "Add"} prompt
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </SheetActions>

          <SheetBody>
            <SheetHeader>
              <SheetTitle>{prompt ? "Edit prompt" : "Add a prompt"}</SheetTitle>
              <SheetDescription className="text-sm">
                {prompt
                  ? "Update this reusable instruction block."
                  : "Create a reusable instruction block for your playbook."}
              </SheetDescription>
            </SheetHeader>

            <SectionSeparator />

            <PromptForm
              prompt={prompt}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onDelete={onClickDelete ? handleDelete : undefined}
            />
          </SheetBody>
        </SheetContent>
      </Sheet>

      {onClickDelete && (
        <ConfirmDialog
          title="Delete prompt?"
          description="Are you sure you want to delete this prompt?"
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={() => {
            setDeleteOpen(false);
            onClickDelete();
          }}
        />
      )}
    </>
  );
}

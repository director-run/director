"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import type { WorkspaceDetail } from "../types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { InputField } from "../ui/form/input-field";
import { TextareaField } from "../ui/form/textarea-field";
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

const PromptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  body: z.string().min(1, "Body is required"),
});

type PromptFormData = z.infer<typeof PromptSchema>;
type Prompt = NonNullable<WorkspaceDetail["prompts"]>[number];

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

  const form = useForm<PromptFormData>({
    resolver: zodResolver(PromptSchema),
    defaultValues: { title: "", description: "", body: "" },
    mode: "onChange",
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (prompt) {
        form.reset({
          title: prompt.title ?? prompt.name,
          description: prompt.description ?? "",
          body: prompt.body ?? "",
        });
      } else {
        form.reset({ title: "", description: "", body: "" });
      }
    }
    onOpenChange(nextOpen);
  };

  useEffect(() => {
    if (prompt) {
      form.reset({
        title: prompt.title ?? prompt.name,
        description: prompt.description ?? "",
        body: prompt.body ?? "",
      });
    } else {
      form.reset({ title: "", description: "", body: "" });
    }
  }, [prompt, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

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
                  : "Create a reusable instruction block for your workspace."}
              </SheetDescription>
            </SheetHeader>

            <SectionSeparator />

            <FormProvider {...form}>
              <form className="flex flex-col gap-y-3" onSubmit={handleSubmit}>
                <InputField
                  name="title"
                  label="Title"
                  placeholder="Enter title…"
                />
                <InputField
                  name="description"
                  label="Description"
                  placeholder="Optional short description…"
                />
                <TextareaField
                  name="body"
                  label="Body"
                  placeholder="Write the prompt body…"
                  rows={8}
                />

                <div className="flex flex-row gap-x-2">
                  <Button
                    type="submit"
                    className="grow"
                    disabled={!form.formState.isValid || isSubmitting}
                  >
                    {isSubmitting ? "Saving…" : "Save"}
                  </Button>
                  {prompt && onClickDelete && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setDeleteOpen(true);
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
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

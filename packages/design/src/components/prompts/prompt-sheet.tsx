"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
}

export function PromptSheet({
  open,
  onOpenChange,
  prompt,
  onSubmit,
  isSubmitting = false,
}: PromptSheetProps) {
  const form = useForm<PromptFormData>({
    resolver: zodResolver(PromptSchema),
    defaultValues: { title: "", description: "", body: "" },
    mode: "onChange",
  });

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
    <Sheet open={open} onOpenChange={onOpenChange}>
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

              <Button
                type="submit"
                disabled={!form.formState.isValid || isSubmitting}
              >
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </form>
          </FormProvider>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

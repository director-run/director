"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import type { PlaybookDetail } from "../types";
import { Button } from "../ui/button";
import { InputField } from "../ui/form/input-field";
import { TextareaField } from "../ui/form/textarea-field";

const PromptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  body: z.string().min(1, "Body is required"),
});

export type PromptFormData = z.infer<typeof PromptSchema>;
type Prompt = NonNullable<PlaybookDetail["prompts"]>[number];

export interface PromptFormProps {
  prompt?: Prompt | null;
  onSubmit: (data: PromptFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  onDelete?: () => Promise<void> | void;
  secondaryButton?: React.ReactNode;
}

export function PromptForm({
  prompt,
  onSubmit,
  isSubmitting = false,
  onDelete,
  secondaryButton,
}: PromptFormProps) {
  const form = useForm<PromptFormData>({
    resolver: zodResolver(PromptSchema),
    defaultValues: { title: "", description: "", body: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (prompt) {
      form.reset({
        title: prompt.title ?? "",
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
    <FormProvider {...form}>
      <form className="flex flex-col gap-y-3" onSubmit={handleSubmit}>
        <InputField name="title" label="Title" placeholder="Enter title…" />
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
          {secondaryButton}
          {prompt && onDelete && (
            <Button type="button" variant="secondary" onClick={onDelete}>
              <TrashIcon />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

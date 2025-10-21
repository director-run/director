import type { ReactNode } from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { FormWithSchema } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { TextareaField } from "../ui/form/textarea-field";
import { Loader } from "../ui/loader";

const playbookSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

export type PlaybookFormData = z.infer<typeof playbookSchema>;

interface PlaybookFormProps {
  children: ReactNode;
  defaultValues?: Partial<PlaybookFormData>;
  onSubmit: (values: PlaybookFormData) => Promise<void>;
}

export function PlaybookForm({
  children,
  onSubmit,
  defaultValues,
}: PlaybookFormProps) {
  const formDefaultValues = {
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
  };

  return (
    <FormWithSchema
      schema={playbookSchema}
      defaultValues={formDefaultValues}
      onSubmit={onSubmit}
    >
      <div className="flex w-full flex-col gap-y-6">
        <InputField label="Name" name="name" placeholder="My playbook" />
        <TextareaField
          label="Description"
          name="description"
          helperLabel="Optional"
          placeholder="A description of the playbook"
        />
      </div>

      {children}
    </FormWithSchema>
  );
}

interface PlaybookFormButtonProps {
  isSubmitting?: boolean;
  children?: ReactNode;
  className?: string;
}

export function PlaybookFormButton({
  isSubmitting = false,
  children,
  className = "self-start",
}: PlaybookFormButtonProps) {
  return (
    <Button
      size="lg"
      className={className}
      type="submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? <Loader className="text-fg-subtle" /> : children}
    </Button>
  );
}

import type { ReactNode } from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { FormWithSchema } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { TextareaField } from "../ui/form/textarea-field";
import { Loader } from "../ui/loader";

const proxySchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

export type ProxyFormData = z.infer<typeof proxySchema>;

interface ProxyFormProps {
  children: ReactNode;
  defaultValues?: Partial<ProxyFormData>;
  onSubmit: (values: ProxyFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProxyForm({
  children,
  onSubmit,
  defaultValues,
  isSubmitting = false,
}: ProxyFormProps) {
  const formDefaultValues = {
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
  };

  return (
    <FormWithSchema
      schema={proxySchema}
      defaultValues={formDefaultValues}
      onSubmit={onSubmit}
    >
      <div className="flex w-full flex-col gap-y-6">
        <InputField label="Name" name="name" placeholder="My Proxy" />
        <TextareaField
          label="Description"
          name="description"
          helperLabel="Optional"
          placeholder="A description of the proxy"
        />
      </div>

      {children}
    </FormWithSchema>
  );
}

interface ProxyFormButtonProps {
  isSubmitting?: boolean;
  children?: ReactNode;
  className?: string;
}

export function ProxyFormButton({
  isSubmitting = false,
  children,
  className = "self-start",
}: ProxyFormButtonProps) {
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

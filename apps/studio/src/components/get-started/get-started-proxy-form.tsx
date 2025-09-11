import { z } from "zod";

import { HiddenField } from "@/components/ui/form/hidden-field";
import { useZodForm } from "../../hooks/use-zod-form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { Loader } from "../ui/loader";

const proxySchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

// Form values type
export type FormValues = z.infer<typeof proxySchema>;

// Presentational component props
interface GetStartedProxyFormProps {
  form: ReturnType<typeof useZodForm<typeof proxySchema>>;
  isPending: boolean;
  onSubmit: (values: FormValues) => void;
}

// Presentational component
export function GetStartedProxyForm({
  form,
  isPending,
  onSubmit,
}: GetStartedProxyFormProps) {
  return (
    <Form
      className="gap-y-4"
      form={form}
      onSubmit={async (values) => {
        await onSubmit(values);
      }}
    >
      <InputField label="Name" name="name" placeholder="My Proxy" />
      <HiddenField name="description" />

      <Button
        size="default"
        className="self-start"
        type="submit"
        disabled={isPending}
      >
        {isPending ? <Loader className="text-fg-subtle" /> : "Create proxy"}
      </Button>
    </Form>
  );
}

export { proxySchema };

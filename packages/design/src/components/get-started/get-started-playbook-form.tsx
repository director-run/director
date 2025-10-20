import { z } from "zod";

import { useZodForm } from "../../hooks/use-zod-form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { HiddenField } from "../ui/form/hidden-field";
import { InputField } from "../ui/form/input-field";
import { Loader } from "../ui/loader";

const playbookSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

// Form values type
export type PlaybookCreateFormValues = z.infer<typeof playbookSchema>;

// Presentational component props
interface GetStartedPlaybookFormProps {
  form: ReturnType<typeof useZodForm<typeof playbookSchema>>;
  isPending: boolean;
  onSubmit: (values: PlaybookCreateFormValues) => void;
}

// Presentational component
export function GetStartedPlaybookForm({
  form,
  isPending,
  onSubmit,
}: GetStartedPlaybookFormProps) {
  return (
    <Form
      className="gap-y-4"
      form={form}
      onSubmit={async (values) => {
        await onSubmit(values);
      }}
    >
      <InputField label="Name" name="name" placeholder="My Playbook" />
      <HiddenField name="description" />

      <Button
        size="default"
        className="self-start"
        type="submit"
        disabled={isPending}
      >
        {isPending ? <Loader className="text-fg-subtle" /> : "Create playbook"}
      </Button>
    </Form>
  );
}

export { playbookSchema };

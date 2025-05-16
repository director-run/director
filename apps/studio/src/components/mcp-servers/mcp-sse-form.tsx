import { useZodForm } from "@/hooks/use-zod-form";
import {} from "react-hook-form";
import { z } from "zod";
import { HiddenField } from "../form/hidden-field";
import { InputField } from "../form/input-field";
import { Form } from "../ui/form";

const mcpSseSchema = z.object({
  type: z.literal("sse"),
  url: z.string().trim().min(1, "Required"),
});

interface McpSseFormProps {
  defaultValues?: Partial<z.infer<typeof mcpSseSchema>>;
}

export function McpSseForm({ defaultValues }: McpSseFormProps) {
  const form = useZodForm({
    schema: mcpSseSchema,
    defaultValues,
  });

  return (
    <Form
      form={form}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      <HiddenField name="type" />
      <InputField label="URL" name="url" />
    </Form>
  );
}

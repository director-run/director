"use client";

import { InputField, TextareaField } from "@/components/fields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useZodForm } from "@/hooks/use-zod-form";
import {
  type CreateProxyInput,
  createProxySchema,
} from "@director/backend/src/services/db/schema";

interface CreateProxyFormProps {
  buttonLabel?: string;
  defaultValues?: Partial<CreateProxyInput>;
  onSubmit: (data: CreateProxyInput) => void;
}

export function ProxyForm({
  buttonLabel,
  onSubmit,
  defaultValues,
}: CreateProxyFormProps) {
  const form = useZodForm({
    schema: createProxySchema,
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      servers: defaultValues?.servers ?? [],
      integrations: defaultValues?.integrations ?? [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        <div className="flex flex-col items-stretch gap-y-6">
          <InputField name="name" label="Name" placeholder="MCP for Claude" />
          <TextareaField
            name="description"
            label="Description"
            description="An optional description for the server"
            placeholder="A little description about this proxy"
          />
        </div>

        <Button className="w-full" size="lg" type="submit">
          {buttonLabel ?? "Create server"}
        </Button>
      </form>
    </Form>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/lib/trpc/trpc";
import {
  type Proxy,
  proxySchema,
} from "@director/backend/src/services/db/schema";
import { toast } from "sonner";
import { InputField, TextareaField } from "../fields";

interface CreateProxyFormProps {
  onSuccess?: (proxy: Proxy) => void;
}

export function CreateProxyForm({ onSuccess }: CreateProxyFormProps) {
  const form = useZodForm({
    schema: proxySchema.omit({ id: true }),
    defaultValues: {
      name: "",
      description: "",
      servers: [],
      integrations: [],
    },
  });

  const utils = trpc.useUtils();

  const createServerMutation = trpc.store.create.useMutation();

  async function onSubmit(data: Omit<Proxy, "id">) {
    const res = await createServerMutation.mutateAsync(data);

    toast("Server created", {
      description: `${res.name} has been created successfully.`,
    });

    await utils.store.getAll.refetch();
    onSuccess?.(res);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <InputField name="name" label="Name" placeholder="MCP for Claude" />
        <TextareaField
          name="description"
          label="Description"
          placeholder="A little description about this proxy"
        />

        <Button size="lg" type="submit">
          Create proxy
        </Button>
      </form>
    </Form>
  );
}

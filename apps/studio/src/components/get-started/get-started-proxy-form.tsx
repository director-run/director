"use client";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { HiddenField } from "@/components/ui/form/hidden-field";
import { InputField } from "@/components/ui/form/input-field";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/components/ui/toast";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";

const proxySchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

export function GetStartedProxyForm() {
  const form = useZodForm({
    schema: proxySchema,
    defaultValues: { name: "", description: "A proxy for getting started" },
  });

  const utils = trpc.useUtils();
  const mutation = trpc.store.create.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.refetch();
      toast({
        title: "Proxy created",
        description: "This proxy was successfully created.",
      });
    },
  });

  const isPending = mutation.isPending;

  return (
    <Form
      className="gap-y-4"
      form={form}
      onSubmit={async (values) => {
        await mutation.mutateAsync({ ...values, servers: [] });
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

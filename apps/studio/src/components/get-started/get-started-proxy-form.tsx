"use client";
import { z } from "zod";

import { HiddenField } from "@/components/ui/form/hidden-field";
import { trpc } from "@/trpc/client";
import { useZodForm } from "../../hooks/use-zod-form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { Loader } from "../ui/loader";
import { toast } from "../ui/toast";

const proxySchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

// tRPC types
type CreateMutation = typeof trpc.store.create.useMutation;
type CreateMutationData = NonNullable<ReturnType<CreateMutation>["data"]>;

// Form values type
type FormValues = z.infer<typeof proxySchema>;

// Presentational component props
interface GetStartedProxyFormViewProps {
  form: ReturnType<typeof useZodForm<typeof proxySchema>>;
  isPending: boolean;
  onSubmit: (values: FormValues) => void;
}

// Presentational component
function GetStartedProxyFormView({
  form,
  isPending,
  onSubmit,
}: GetStartedProxyFormViewProps) {
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

// Smart component that manages state and tRPC calls
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

  const handleSubmit = async (values: FormValues) => {
    await mutation.mutateAsync({ ...values, servers: [] });
  };

  return (
    <GetStartedProxyFormView
      form={form}
      isPending={isPending}
      onSubmit={handleSubmit}
    />
  );
}

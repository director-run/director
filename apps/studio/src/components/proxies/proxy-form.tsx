"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form/input-field";
import { TextareaField } from "@/components/ui/form/textarea-field";
import { Loader } from "@/components/ui/loader";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";
import { ProxyAttributes } from "@director.run/gateway/db/schema";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { z } from "zod";
import { toast } from "../ui/toast";

const proxySchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

interface ProxyFormProps {
  children: ReactNode;
  defaultValues?: Partial<z.infer<typeof proxySchema>>;
  onSubmit: (values: z.infer<typeof proxySchema>) => Promise<void>;
}

export function ProxyForm({
  children,
  onSubmit,
  defaultValues,
}: ProxyFormProps) {
  const form = useZodForm({
    schema: proxySchema,
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  return (
    <Form form={form} onSubmit={onSubmit}>
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
    </Form>
  );
}

export function NewProxyForm() {
  const router = useRouter();

  const utils = trpc.useUtils();
  const mutation = trpc.store.create.useMutation({
    onSuccess: async (response) => {
      await utils.store.getAll.refetch();
      toast({
        title: "Proxy created",
        description: "This proxy was successfully created.",
      });
      router.push(`/proxies/${response.id}`);
    },
  });

  const isPending = mutation.isPending;

  return (
    <ProxyForm
      onSubmit={async (values) => {
        await mutation.mutateAsync({ ...values, servers: [] });
      }}
    >
      <Button
        size="lg"
        className="self-start"
        type="submit"
        disabled={isPending}
      >
        {isPending ? (
          <Loader className="text-foreground-subtle" />
        ) : (
          "Create proxy"
        )}
      </Button>
    </ProxyForm>
  );
}

export function UpdateProxyForm(
  props: ProxyAttributes & { onSuccess?: () => void },
) {
  const router = useRouter();

  const utils = trpc.useUtils();
  const mutation = trpc.store.update.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: props.id });
      toast({
        title: "Proxy updated",
        description: "This proxy was successfully updated.",
      });
      router.refresh();
    },
  });

  const isPending = mutation.isPending;

  return (
    <ProxyForm
      onSubmit={async (values) => {
        await mutation.mutateAsync({
          proxyId: props.id,
          attributes: { ...values },
        });
        props.onSuccess?.();
      }}
      defaultValues={{
        name: props.name,
        description: props.description ?? undefined,
      }}
    >
      <Button className="self-start" type="submit" disabled={isPending}>
        {isPending ? (
          <Loader className="text-foreground-subtle" />
        ) : (
          "Save changes"
        )}
      </Button>
    </ProxyForm>
  );
}

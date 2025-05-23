"use client";

import { EntryGetParams } from "@director.run/registry/db/schema";
import { useRouter } from "next/navigation";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form/input-field";
import { toast } from "@/components/ui/toast";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";

interface McpInstallFormProps {
  entry: EntryGetParams;
  proxyId: string;
}

export function McpInstallForm({ entry, proxyId }: McpInstallFormProps) {
  const router = useRouter();
  const parameters = entry.parameters ?? [];

  const utils = trpc.useUtils();

  const installMutation = trpc.registry.addServerFromRegistry.useMutation({
    onSuccess: () => {
      utils.store.get.invalidate({ proxyId });
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
      router.push(`/proxies/${proxyId}`);
    },
  });

  const schema = z.object({
    parameters: z.object(
      parameters.reduce(
        (acc, param) => {
          acc[param.name] = z.string().trim().min(1, "Required");
          return acc;
        },
        {} as Record<string, z.ZodType<string>>,
      ),
    ),
  });

  const form = useZodForm({
    schema,
    defaultValues: {
      parameters: parameters.reduce(
        (acc, param) => {
          acc[param.name] = "";
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
  });

  return (
    <Form
      form={form}
      onSubmit={(values) => {
        installMutation.mutate({
          entryName: entry.name,
          proxyId: proxyId,
          parameters: values.parameters,
        });
      }}
    >
      {parameters.map((param) => (
        <InputField
          key={`${param.name}/${param.scope}`}
          name={`parameters.${param.name}`}
          label={param.name}
        />
      ))}

      <Button type="submit">Install</Button>
    </Form>
  );
}

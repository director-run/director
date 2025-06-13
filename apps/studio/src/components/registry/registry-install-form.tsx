"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form/input-field";
import { SelectNativeField } from "@/components/ui/form/select-native-field";
import { toast } from "@/components/ui/toast";
import { useRegistryQuery } from "@/hooks/use-registry-query";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";
import type { ProxyAttributes } from "@director.run/gateway/db/schema";
import { EntryGetParams } from "@director.run/registry/db/schema";
import { useRouter } from "next/navigation";
import { z } from "zod";

interface RegistryInstallFormProps {
  mcp: EntryGetParams;
  proxies: ProxyAttributes[];
}

export function RegistryInstallForm({
  mcp,
  proxies,
}: RegistryInstallFormProps) {
  const router = useRouter();
  const { serverId } = useRegistryQuery();
  const parameters = (mcp.parameters ?? []).filter(
    (parameter, index, array) =>
      array.findIndex((p) => p.name === parameter.name) === index,
  );

  const utils = trpc.useUtils();

  const transportMutation = trpc.registry.getTransportForEntry.useMutation();

  const installMutation = trpc.store.addServer.useMutation({
    onSuccess: (data) => {
      utils.store.get.invalidate({ proxyId: data.id });
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
      router.push(`/${data.id}`);
    },
  });

  const schema = z.object({
    proxyId: z.string(),
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
      proxyId: serverId ?? proxies[0]?.id ?? "",
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
      onSubmit={async (values) => {
        const transport = await transportMutation.mutateAsync({
          entryName: mcp.name,
          parameters: values.parameters,
        });
        installMutation.mutate({
          proxyId: values.proxyId,
          server: {
            name: mcp.name,
            transport,
            source: {
              name: "registry",
              entryId: mcp.id,
              entryData: mcp,
            },
          },
        });
      }}
    >
      <SelectNativeField name="proxyId" label="Proxy">
        {proxies.map((it) => {
          const alreadyInstalled = it.servers.find(
            (it) => it.name === mcp.name,
          );

          return (
            <option key={it.id} value={it.id} disabled={!!alreadyInstalled}>
              {it.name}
            </option>
          );
        })}
      </SelectNativeField>
      {parameters.map((param) => (
        <InputField
          key={`${param.name}/${param.scope}`}
          name={`parameters.${param.name}`}
          label={param.name}
        />
      ))}

      <Button type="submit" disabled={installMutation.isPending}>
        {installMutation.isPending ? "Installing..." : "Install"}
      </Button>
    </Form>
  );
}

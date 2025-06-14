"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/form/input-field";
import { SelectNativeField } from "@/components/ui/form/select-native-field";
import { toast } from "@/components/ui/toast";
import { useRegistryQuery } from "@/hooks/use-registry-query";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";
import type { EntryGetParams } from "@director.run/registry/db/schema";
import type { ProxyServerAttributes } from "@director.run/utilities/schema";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";
import { z } from "zod";

interface RegistryInstallDialogProps extends ComponentProps<typeof Dialog> {
  mcp: EntryGetParams;
  proxies: ProxyServerAttributes[];
}

export function RegistryInstallDialog({
  mcp,
  proxies,
  children,
  ...props
}: RegistryInstallDialogProps) {
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
    <Dialog {...props}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install {mcp.title}</DialogTitle>
          <DialogDescription>
            Add this MCP server to one of your proxies.
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form}
          className="gap-y-0 border-t-[0.5px]"
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
          <div className="flex flex-col gap-y-5 p-5">
            <SelectNativeField name="proxyId" label="Proxy">
              {proxies.map((it) => {
                const alreadyInstalled = it.servers.find(
                  (it) => it.name === mcp.name,
                );

                return (
                  <option
                    key={it.id}
                    value={it.id}
                    disabled={!!alreadyInstalled}
                  >
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
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={installMutation.isPending}>
              {installMutation.isPending ? "Installing..." : "Install"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

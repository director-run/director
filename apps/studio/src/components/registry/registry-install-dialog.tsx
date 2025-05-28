"use client";

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
import { useRegistryQuery } from "@/hooks/use-registry-query";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";
import type { ProxyAttributes } from "@director.run/gateway/db/schema";
import { EntryGetParams } from "@director.run/registry/db/schema";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { SelectNativeField } from "../ui/form/select-native-field";
import { toast } from "../ui/toast";

interface RegistryInstallDialogProps extends ComponentProps<typeof Dialog> {
  mcp: EntryGetParams;
  proxies: ProxyAttributes[];
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

  const installMutation = trpc.registry.addServerFromRegistry.useMutation({
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
      proxyId: serverId ?? proxies[0].id ?? "",
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
          onSubmit={(values) => {
            installMutation.mutate({
              entryName: mcp.name,
              proxyId: values.proxyId,
              parameters: values.parameters,
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

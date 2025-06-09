"use client";

import { EntryGetParams } from "@director.run/registry/db/schema";
import { ComponentProps } from "react";
import { z } from "zod";

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
import { HiddenField } from "@/components/ui/form/hidden-field";
import { InputField } from "@/components/ui/form/input-field";
import { toast } from "@/components/ui/toast";
import { useZodForm } from "@/hooks/use-zod-form";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";

interface GetStartedInstallServerDialogProps
  extends ComponentProps<typeof Dialog> {
  mcp: EntryGetParams;
  proxyId: string;
}

export function GetStartedInstallServerDialog({
  mcp,
  proxyId,
  children,
  ...props
}: GetStartedInstallServerDialogProps) {
  const parameters = (mcp.parameters ?? []).filter(
    (parameter, index, array) =>
      array.findIndex((p) => p.name === parameter.name) === index,
  );
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
      proxyId: proxyId,
      parameters: parameters.reduce(
        (acc, param) => {
          acc[param.name] = "";
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
  });

  const utils = trpc.useUtils();

  const transportMutation = trpc.registry.getTransportForEntry.useMutation();

  const installMutation = trpc.store.addServer.useMutation({
    onSuccess: (data) => {
      utils.store.getAll.invalidate();
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
    },
  });

  const isDisabled = form.formState.isSubmitting || installMutation.isPending;

  return (
    <Dialog {...props}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install {mcp.title}</DialogTitle>
          <DialogDescription>{mcp.description}</DialogDescription>
        </DialogHeader>

        <Form
          form={form}
          className={cn(
            "gap-y-0 border-t-[0.5px]",
            parameters.length === 0 && "border-t-0",
          )}
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
          <div
            className={cn(
              "flex flex-col gap-y-5 p-5",
              parameters.length === 0 && "p-0",
            )}
          >
            <HiddenField name="proxyId" />

            {parameters.map((param) => (
              <InputField
                key={`${param.name}/${param.scope}`}
                name={`parameters.${param.name}`}
                label={param.name}
              />
            ))}
          </div>

          <DialogFooter>
            <DialogClose disabled={isDisabled} asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isDisabled}>
              {isDisabled ? "Adding..." : "Add to proxy"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

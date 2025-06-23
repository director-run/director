"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SectionSeparator } from "@/components/ui/section";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useZodForm } from "@/hooks/use-zod-form";
import { trpc } from "@/trpc/client";
import {
  proxyTargetAttributesSchema,
  requiredStringSchema,
} from "@director.run/utilities/schema";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, useEffect, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { SelectNativeField } from "../ui/form/select-native-field";
import { TextareaField } from "../ui/form/textarea-field";
import { Label } from "../ui/label";
import { toast } from "../ui/toast";

const nonEmptyTupleSchema = z
  .array(z.tuple([z.string(), z.string()]))
  .transform((data) => {
    return data.filter(([key, value]) => {
      if (key.trim() === "" || value.trim() === "") {
        return false;
      }

      return true;
    });
  })
  .refine(
    (envVars) => {
      // All items except the last one must have non-empty strings
      for (let i = 0; i <= envVars.length - 1; i++) {
        if (envVars[i][0].trim() === "" || envVars[i][1].trim() === "") {
          return false;
        }
      }

      return true;
    },
    {
      message: "All values must have both name and value",
    },
  );

const formSchema = z.object({
  proxyId: requiredStringSchema,
  server: proxyTargetAttributesSchema,
  _env: nonEmptyTupleSchema,
  _headers: nonEmptyTupleSchema,
});

type FormData = z.infer<typeof formSchema>;

interface McpAddSheetProps extends ComponentProps<typeof Sheet> {}

export function McpAddSheet({
  children,
  open,
  onOpenChange,
  ...props
}: McpAddSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();
  const form = useZodForm({
    schema: formSchema,
    defaultValues: {
      proxyId: "",
      server: {
        name: "",
        transport: {
          type: "stdio",
          command: "",
          args: [],
          env: {},
        },
      },
      _env: [["", ""]],
      _headers: [["", ""]],
    },
  });

  const _env = useFieldArray({
    control: form.control,
    name: "_env",
  });

  const _headers = useFieldArray({
    control: form.control,
    name: "_headers",
  });

  const proxyQuery = trpc.store.getAll.useQuery();

  const proxies = proxyQuery.data ?? [];

  const addServerMutation = trpc.store.addServer.useMutation({
    onSuccess: async (data) => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: data.id });

      toast({
        title: "Server added",
        description: "The server has been added to the proxy",
      });
      onOpenChange ? onOpenChange(false) : setIsOpen(false);
      router.push(`/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Failed to add server",
        description: "Please check Director CLI logs for more information.",
      });
    },
  });

  useEffect(() => {
    form.setValue("proxyId", proxies[0].id);
  }, [proxies]);

  async function onSubmit(data: FormData) {
    const server = data.server;

    if (server.transport.type === "stdio") {
      const env = data._env.reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );

      const cmd = server.transport.command.split(" ")[0];
      const args = server.transport.command.split(" ").slice(1).join(" ");

      await addServerMutation.mutateAsync({
        proxyId: data.proxyId,
        server: {
          name: data.server.name,
          transport: {
            type: "stdio",
            command: cmd,
            args: [args],
            env: Object.keys(env).length > 0 ? env : undefined,
          },
        },
      });
    } else {
      const headers = data._headers.reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );

      await addServerMutation.mutateAsync({
        proxyId: data.proxyId,
        server: {
          name: data.server.name,
          transport: {
            type: "http",
            url: server.transport.url,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
          },
        },
      });
    }
  }

  const serverType = form.watch("server.transport.type");

  return (
    <Sheet
      open={open || isOpen}
      onOpenChange={onOpenChange || setIsOpen}
      {...props}
    >
      {children && <SheetTrigger asChild>{children}</SheetTrigger>}
      <SheetContent>
        <SheetActions>
          <Breadcrumb className="grow">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/library`}>Library</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Add MCP server</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </SheetActions>

        <SheetBody>
          <SheetHeader>
            <SheetTitle>Add an MCP server</SheetTitle>
            <SheetDescription className="text-sm">
              Manually add an MCP server to one of your proxies.
            </SheetDescription>
          </SheetHeader>

          <SectionSeparator />

          {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
          <Form form={form as any} onSubmit={onSubmit}>
            {proxyQuery.data ? (
              <SelectNativeField
                name="proxyId"
                label="Proxy"
                disabled={proxyQuery.isLoading}
              >
                {proxies.map((proxy) => (
                  <option key={proxy.id} value={proxy.id}>
                    {proxy.name}
                  </option>
                ))}
              </SelectNativeField>
            ) : (
              <SelectNativeField
                name="proxyId"
                label="Proxy"
                disabled={proxyQuery.isLoading}
              >
                <option value="">Loading…</option>
              </SelectNativeField>
            )}

            <div className="flex flex-row gap-x-2 [&>div]:flex-1">
              <InputField
                label="Name"
                name="server.name"
                placeholder="Enter server name…"
              />
              <SelectNativeField label="Transport" name="server.transport.type">
                <option value="stdio">STDIO</option>
                <option value="http">HTTP</option>
              </SelectNativeField>
            </div>

            {serverType === "stdio" && (
              <>
                <TextareaField
                  className="min-h-auto"
                  label="Command"
                  name="server.transport.command"
                  placeholder="e.g. npx -y @modelcontextprotocol/my-server <filepath>"
                />

                <div className="flex flex-col gap-y-2">
                  <Label>Environment variables</Label>

                  {_env.fields.map((field, index) => {
                    const isLast = index === _env.fields.length - 1;
                    return (
                      <div
                        className="flex flex-row gap-x-2 [&>div]:flex-1"
                        key={field.id}
                      >
                        <InputField
                          name={`_env.${index}.0`}
                          placeholder="Variable name"
                        />
                        <InputField
                          name={`_env.${index}.1`}
                          placeholder="Value"
                        />
                        {isLast ? (
                          <Button
                            className="size-8 leading-8"
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => {
                              _env.append([["", ""]]);
                            }}
                          >
                            <PlusIcon />
                            <div className="sr-only">Remove</div>
                          </Button>
                        ) : (
                          <Button
                            className="size-8 leading-8"
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => {
                              _env.remove(index);
                            }}
                          >
                            <TrashIcon />
                            <div className="sr-only">Remove</div>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {serverType === "http" && (
              <>
                <InputField
                  label="URL"
                  name="server.transport.url"
                  placeholder="Enter server URL…"
                />

                <div className="flex flex-col gap-y-2">
                  <Label>Headers</Label>

                  {_headers.fields.map((field, index) => {
                    const isLast = index === _headers.fields.length - 1;
                    return (
                      <div
                        className="flex flex-row gap-x-2 [&>div]:flex-1"
                        key={field.id}
                      >
                        <InputField
                          name={`_headers.${index}.0`}
                          placeholder="Variable name"
                        />
                        <InputField
                          name={`_headers.${index}.1`}
                          placeholder="Value"
                        />
                        {isLast ? (
                          <Button
                            className="size-8 leading-8"
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => {
                              _headers.append([["", ""]]);
                            }}
                          >
                            <PlusIcon />
                            <div className="sr-only">Remove</div>
                          </Button>
                        ) : (
                          <Button
                            className="size-8 leading-8"
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => {
                              _headers.remove(index);
                            }}
                          >
                            <TrashIcon />
                            <div className="sr-only">Remove</div>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <Button type="submit">Add MCP Server</Button>
          </Form>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

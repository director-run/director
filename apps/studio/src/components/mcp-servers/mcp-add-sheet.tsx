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
import { PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { ComponentProps, ReactNode } from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { FormWithSchema } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { SelectNativeField } from "../ui/form/select-native-field";
import { TextareaField } from "../ui/form/textarea-field";
import { Label } from "../ui/label";

export const requiredStringSchema = z.string().trim().min(1, "Required");

export const slugStringSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .regex(
    /^[a-z0-9._-]+$/,
    "Only lowercase ASCII letters, digits, and characters ., -, _ are allowed",
  );

export const httpTransportSchema = z.object({
  type: z.literal("http"),
  url: requiredStringSchema.url(),
  headers: z.record(requiredStringSchema, z.string()).optional(),
});

export type HTTPTransport = z.infer<typeof httpTransportSchema>;

export const stdioTransportSchema = z.object({
  type: z.literal("stdio"),
  command: requiredStringSchema,
  args: z.array(z.string()).default([]),
  env: z.record(requiredStringSchema, z.string()).optional(),
});

export type STDIOTransport = z.infer<typeof stdioTransportSchema>;

export const proxyTransport = z.discriminatedUnion("type", [
  httpTransportSchema,
  stdioTransportSchema,
]);

export const ProxyTargetSourceSchema = z.object({
  name: z.literal("registry"),
  entryId: requiredStringSchema,
});

export const proxyTargetAttributesSchema = z.object({
  name: slugStringSchema,
  transport: proxyTransport,
  source: ProxyTargetSourceSchema.optional(),
  toolPrefix: z.string().trim().optional(),
  disabledTools: z.array(requiredStringSchema).optional(),
  disabled: z.boolean().optional(),
});

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

export type McpAddFormData = z.infer<typeof formSchema>;

interface Proxy {
  id: string;
  name: string;
}

interface McpAddSheetProps extends ComponentProps<typeof Sheet> {
  children?: ReactNode;
  proxies: Proxy[];
  isLoadingProxies?: boolean;
  onSubmit: (data: McpAddFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function McpAddSheet({
  children,
  open,
  onOpenChange,
  proxies,
  isLoadingProxies = false,
  onSubmit,
  isSubmitting = false,
  ...props
}: McpAddSheetProps) {
  const defaultValues = {
    proxyId: proxies[0]?.id ?? "",
    server: {
      name: "",
      transport: {
        type: "stdio" as const,
        command: "",
        args: [],
        env: {},
      },
    },
    _env: [["", ""]] as [string, string][],
    _headers: [["", ""]] as [string, string][],
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} {...props}>
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

          <McpAddForm
            defaultValues={defaultValues}
            proxies={proxies}
            isLoadingProxies={isLoadingProxies}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

interface McpAddFormProps {
  defaultValues: McpAddFormData;
  proxies: Proxy[];
  isLoadingProxies?: boolean;
  onSubmit: (data: McpAddFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function McpAddForm({
  defaultValues,
  proxies,
  isLoadingProxies = false,
  onSubmit,
  isSubmitting = false,
}: McpAddFormProps) {
  return (
    <FormWithSchema
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    >
      <McpAddFormFields
        proxies={proxies}
        isLoadingProxies={isLoadingProxies}
        isSubmitting={isSubmitting}
      />
    </FormWithSchema>
  );
}

interface McpAddFormFieldsProps {
  proxies: Proxy[];
  isLoadingProxies?: boolean;
  isSubmitting?: boolean;
}

export function McpAddFormFields({
  proxies,
  isLoadingProxies = false,
  isSubmitting = false,
}: McpAddFormFieldsProps) {
  return (
    <>
      <SelectNativeField
        name="proxyId"
        label="Proxy"
        disabled={isLoadingProxies}
      >
        {isLoadingProxies ? (
          <option value="">Loading…</option>
        ) : (
          proxies.map((proxy) => (
            <option key={proxy.id} value={proxy.id}>
              {proxy.name}
            </option>
          ))
        )}
      </SelectNativeField>

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

      <McpAddFormTransportFields />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add MCP Server"}
      </Button>
    </>
  );
}

export function McpAddFormTransportFields() {
  return (
    <>
      <McpAddFormStdioFields />
      <McpAddFormHttpFields />
    </>
  );
}

export function McpAddFormStdioFields() {
  return (
    <div className="space-y-4">
      <TextareaField
        className="min-h-auto"
        label="Command"
        name="server.transport.command"
        placeholder="e.g. npx -y @modelcontextprotocol/my-server <filepath>"
      />

      <div className="flex flex-col gap-y-2">
        <Label>Environment variables</Label>
        <McpAddFormEnvFields />
      </div>
    </div>
  );
}

export function McpAddFormHttpFields() {
  return (
    <div className="space-y-4">
      <InputField
        label="URL"
        name="server.transport.url"
        placeholder="Enter server URL…"
      />

      <div className="flex flex-col gap-y-2">
        <Label>Headers</Label>
        <McpAddFormHeaderFields />
      </div>
    </div>
  );
}

export function McpAddFormEnvFields() {
  return (
    <div className="space-y-2">
      <div className="flex flex-row gap-x-2 [&>div]:flex-1">
        <InputField name="_env.0.0" placeholder="Variable name" />
        <InputField name="_env.0.1" placeholder="Value" />
        <Button
          className="size-8 leading-8"
          type="button"
          variant="secondary"
          size="icon"
        >
          <PlusIcon />
          <div className="sr-only">Add</div>
        </Button>
      </div>
    </div>
  );
}

export function McpAddFormHeaderFields() {
  return (
    <div className="space-y-2">
      <div className="flex flex-row gap-x-2 [&>div]:flex-1">
        <InputField name="_headers.0.0" placeholder="Variable name" />
        <InputField name="_headers.0.1" placeholder="Value" />
        <Button
          className="size-8 leading-8"
          type="button"
          variant="secondary"
          size="icon"
        >
          <PlusIcon />
          <div className="sr-only">Add</div>
        </Button>
      </div>
    </div>
  );
}

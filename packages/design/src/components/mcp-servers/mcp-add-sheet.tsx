import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { FormWithSchema } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { SelectNativeField } from "../ui/form/select-native-field";
import { TextareaField } from "../ui/form/textarea-field";
import { Label } from "../ui/label";
import { SectionSeparator } from "../ui/section";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

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
  args: z.array(z.string()),
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
  onLibraryClick?: () => void;
}

export function McpAddSheet({
  children,
  open,
  onOpenChange,
  proxies,
  isLoadingProxies = false,
  onSubmit,
  isSubmitting = false,
  onLibraryClick,
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
                <BreadcrumbLink
                  onClick={onLibraryClick}
                  className="cursor-pointer"
                >
                  Library
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
  const { control } = useFormContext();
  const transportType = useWatch({
    control,
    name: "server.transport.type",
    defaultValue: "stdio",
  });

  console.log("Current transport type:", transportType);

  return (
    <>
      {transportType === "stdio" && <McpAddFormStdioFields />}
      {transportType === "http" && <McpAddFormHttpFields />}
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
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "_env",
  });

  const handleAdd = () => {
    console.log("Adding env field, current fields length:", fields.length);
    append(["", ""]);
    console.log("After append, fields length should be:", fields.length + 1);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-row gap-x-2 [&>div]:flex-1">
          <InputField
            name={`_env.${index}.0`}
            placeholder="Variable name"
            defaultValue=""
          />
          <InputField
            name={`_env.${index}.1`}
            placeholder="Value"
            defaultValue=""
          />
          {fields.length > 1 ? (
            <Button
              className="size-8 leading-8"
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => remove(index)}
            >
              <MinusIcon />
              <div className="sr-only">Remove</div>
            </Button>
          ) : (
            <div className="size-8" />
          )}
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
        <PlusIcon className="mr-2 size-4" />
        Add environment variable
      </Button>
    </div>
  );
}

export function McpAddFormHeaderFields() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "_headers",
  });

  const handleAdd = () => {
    console.log("Adding header field, current fields length:", fields.length);
    append(["", ""]);
    console.log("After append, fields length should be:", fields.length + 1);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-row gap-x-2 [&>div]:flex-1">
          <InputField
            name={`_headers.${index}.0`}
            placeholder="Header name"
            defaultValue=""
          />
          <InputField
            name={`_headers.${index}.1`}
            placeholder="Value"
            defaultValue=""
          />
          {fields.length > 1 ? (
            <Button
              className="size-8 leading-8"
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => remove(index)}
            >
              <MinusIcon />
              <div className="sr-only">Remove</div>
            </Button>
          ) : (
            <div className="size-8" />
          )}
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
        <PlusIcon className="mr-2 size-4" />
        Add header
      </Button>
    </div>
  );
}

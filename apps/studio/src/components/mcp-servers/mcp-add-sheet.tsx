import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { type ComponentProps } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Breadcrumb,
  BreadcrumbItem,
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
} from "../ui/sheet";

const requiredStringSchema = z.string().trim().min(1, "Required");

const slugStringSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .regex(
    /^[a-z0-9._-]+$/,
    "Only lowercase ASCII letters, digits, and characters ., -, _ are allowed",
  );

const httpTransportSchema = z.object({
  type: z.literal("http"),
  url: requiredStringSchema.url(),
  headers: z.record(requiredStringSchema, z.string()).optional(),
});

type HTTPTransport = z.infer<typeof httpTransportSchema>;

const stdioTransportSchema = z.object({
  type: z.literal("stdio"),
  command: requiredStringSchema,
  args: z.array(z.string()),
  env: z.record(requiredStringSchema, z.string()).optional(),
});

type STDIOTransport = z.infer<typeof stdioTransportSchema>;

const proxyTransport = z.discriminatedUnion("type", [
  httpTransportSchema,
  stdioTransportSchema,
]);

const ProxyTargetSourceSchema = z.object({
  name: z.literal("registry"),
  entryId: requiredStringSchema,
});

const proxyTargetAttributesSchema = z.object({
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
  proxyId: z.string().optional(),
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
  proxies?: Proxy[];
  onSubmit: (data: McpAddFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function McpAddSheet({
  open,
  onOpenChange,
  proxies,
  onSubmit,
  isSubmitting = false,
  ...props
}: McpAddSheetProps) {
  const defaultValues = {
    proxyId: proxies?.[0]?.id ?? undefined,
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
      <SheetContent>
        <SheetActions>
          <Breadcrumb className="grow">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Library</BreadcrumbPage>
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
  proxies?: Proxy[];
  onSubmit: (data: McpAddFormData) => Promise<void>;
  isSubmitting?: boolean;
}

function McpAddForm({
  defaultValues,
  proxies,
  onSubmit,
  isSubmitting = false,
}: McpAddFormProps) {
  return (
    <FormWithSchema
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    >
      <McpAddFormFields proxies={proxies} isSubmitting={isSubmitting} />
    </FormWithSchema>
  );
}

interface McpAddFormFieldsProps {
  proxies?: Proxy[];
  isSubmitting?: boolean;
}

function McpAddFormFields({
  proxies,
  isSubmitting = false,
}: McpAddFormFieldsProps) {
  const { control } = useFormContext();
  const transportType = useWatch({
    control,
    name: "server.transport.type",
    defaultValue: "stdio",
  });

  return (
    <>
      {proxies && (
        <SelectNativeField name="proxyId" label="Proxy">
          {proxies.map((proxy) => (
            <option key={proxy.id} value={proxy.id}>
              {proxy.name}
            </option>
          ))}
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

      {transportType === "stdio" && <McpAddFormStdioFields />}
      {transportType === "http" && <McpAddFormHttpFields />}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add MCP Server"}
      </Button>
    </>
  );
}

function McpAddFormStdioFields() {
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
        <KeyValueFieldArray
          name="_env"
          keyPlaceholder="Variable name"
          valuePlaceholder="Value"
          addSrText="Add environment variable"
        />{" "}
      </div>
    </div>
  );
}

function McpAddFormHttpFields() {
  return (
    <div className="space-y-4">
      <InputField
        label="URL"
        name="server.transport.url"
        placeholder="Enter server URL…"
      />

      <div className="flex flex-col gap-y-2">
        <Label>Headers</Label>
        <KeyValueFieldArray
          name="_headers"
          keyPlaceholder="Header name"
          valuePlaceholder="Value"
          addSrText="Add header"
        />
      </div>
    </div>
  );
}

function KeyValueFieldArray({
  name,
  keyPlaceholder,
  valuePlaceholder,
  addSrText,
}: {
  name: string;
  keyPlaceholder: string;
  valuePlaceholder: string;
  addSrText: string;
}) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const handleAdd = () => {
    append(["", ""]);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-row gap-x-2 [&>div]:flex-1">
          <InputField
            name={`${name}.${index}.0`}
            placeholder={keyPlaceholder}
          />
          <InputField
            name={`${name}.${index}.1`}
            placeholder={valuePlaceholder}
          />
          {index < fields.length - 1 ? (
            <Button
              className="size-8 leading-8"
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => remove(index)}
            >
              <TrashIcon />
              <div className="sr-only">Remove</div>
            </Button>
          ) : (
            <Button
              className="size-8 leading-8"
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleAdd}
            >
              <PlusIcon />
              <div className="sr-only">{addSrText}</div>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

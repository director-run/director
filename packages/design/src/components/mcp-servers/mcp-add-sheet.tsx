import {
  requiredStringSchema,
  slugStringSchema,
} from "@director.run/utilities/schema";
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

interface Playbook {
  id: string;
  name: string;
}

interface PlaybookTargetAddSheetProps extends ComponentProps<typeof Sheet> {
  playbooks?: Playbook[];
  onSubmit: (data: PlaybookTargetFormData) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function PlaybookTargetAddSheet({
  open,
  onOpenChange,
  playbooks,
  onSubmit,
  isSubmitting = false,
  ...props
}: PlaybookTargetAddSheetProps) {
  const defaultValues = {
    playbookId: playbooks?.[0]?.id ?? undefined,
    server: {
      name: "",
      type: "http" as const,
      url: "",
      headers: {},
    },
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
              Manually add an MCP server to one of your playbooks.
            </SheetDescription>
          </SheetHeader>

          <SectionSeparator />

          <PlaybookTargetForm
            defaultValues={defaultValues}
            playbooks={playbooks}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

interface PlaybookTargetFormProps {
  defaultValues: PlaybookTargetFormData;
  playbooks?: Playbook[];
  onSubmit: (data: PlaybookTargetFormData) => Promise<void> | void;
  isSubmitting?: boolean;
}

function PlaybookTargetForm({
  defaultValues,
  playbooks,
  onSubmit,
  isSubmitting = false,
}: PlaybookTargetFormProps) {
  return (
    <FormWithSchema
      schema={formSchema}
      defaultValues={{
        ...defaultValues,
        _env: [{ key: "", value: "" }],
        _headers: [{ key: "", value: "" }],
      }}
      onSubmit={(data) => {
        if (data.server.type === "stdio") {
          onSubmit({
            playbookId: data.playbookId,
            server: {
              ...data.server,
              command: data.server.command.split(" ")[0],
              args: data.server.command.split(" ").slice(1),
              env: data._env.reduce(
                (acc, { key, value }) => {
                  if (!!key) {
                    acc[key] = value;
                  }
                  return acc;
                },
                {} as Record<string, string>,
              ),
            },
          });
        } else if (data.server.type === "http") {
          onSubmit({
            playbookId: data.playbookId,
            server: {
              ...data.server,
              headers: data._headers.reduce(
                (acc, { key, value }) => {
                  if (!!key) {
                    acc[key] = value;
                  }
                  return acc;
                },
                {} as Record<string, string>,
              ),
            },
          });
        }
      }}
    >
      <McpAddFormFields playbooks={playbooks} isSubmitting={isSubmitting} />
    </FormWithSchema>
  );
}

interface McpAddFormFieldsProps {
  playbooks?: Playbook[];
  isSubmitting?: boolean;
}

function McpAddFormFields({
  playbooks,
  isSubmitting = false,
}: McpAddFormFieldsProps) {
  const { control } = useFormContext();
  const transportType = useWatch({
    control,
    name: "server.type",
    defaultValue: "http",
  });

  return (
    <>
      {playbooks && (
        <SelectNativeField name="playbookId" label="Playbook">
          {playbooks.map((playbook) => (
            <option key={playbook.id} value={playbook.id}>
              {playbook.name}
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
        <SelectNativeField label="Transport" name="server.type">
          <option value="http">HTTP</option>
          <option value="stdio">STDIO</option>
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
        name="server.command"
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
        name="server.url"
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
    append({
      key: "",
      value: "",
    });
  };

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-row gap-x-2 [&>div]:flex-1">
          <InputField
            name={`${name}.${index}.key`}
            placeholder={keyPlaceholder}
          />
          <InputField
            name={`${name}.${index}.value`}
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

const PlaybookStdioTargetAttributesSchema = z.object({
  name: slugStringSchema,
  type: z.literal("stdio"),
  command: requiredStringSchema,
  args: z.array(z.string()),
  env: z.record(requiredStringSchema, z.string()).optional(),
});

const PlaybookHTTPTargetAttributesSchema = z.object({
  name: slugStringSchema,
  type: z.literal("http"),
  url: requiredStringSchema.url(),
  headers: z.record(requiredStringSchema, z.string()).optional(),
});

const formSchema = z.object({
  playbookId: z.string().optional(),
  server: z.discriminatedUnion("type", [
    PlaybookStdioTargetAttributesSchema,
    PlaybookHTTPTargetAttributesSchema,
  ]),
  _env: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
  _headers: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
    }),
  ),
});

export type PlaybookTargetFormData = Omit<
  z.infer<typeof formSchema>,
  "_env" | "_headers"
>;

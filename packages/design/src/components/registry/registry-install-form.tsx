import { z } from "zod";
import type { PlaybookList, RegistryEntryDetail } from "../types";
import { Button } from "../ui/button";
import { EmptyState, EmptyStateDescription } from "../ui/empty-state";
import { FormWithSchema } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { SelectNativeField } from "../ui/form/select-native-field";
import { SimpleMarkdown } from "../ui/markdown";

interface RegistryInstallFormProps {
  registryEntry: Pick<RegistryEntryDetail, "name" | "id" | "parameters">;
  playbooks?: PlaybookList;
  defaultPlaybookId?: string;
  onClickCancel?: () => void;
  onSubmit: (params: {
    playbookId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function RegistryInstallForm({
  registryEntry,
  playbooks,
  defaultPlaybookId,
  onClickCancel,
  onSubmit,
  isSubmitting = false,
}: RegistryInstallFormProps) {
  const parameters = (registryEntry.parameters ?? []).filter(
    (parameter, index, array) =>
      array.findIndex((p) => p.name === parameter.name) === index,
  );

  // Calculate which playbooks already have this entry installed
  const entryInstalledOn = (playbooks ?? [])
    .filter((playbook) =>
      playbook.servers.some((it) => it.name === registryEntry.name),
    )
    .map((p) => p.id);

  // Filter out playbooks where the entry is already installed
  const availablePlaybooks = playbooks?.filter(
    (playbook) => !entryInstalledOn.includes(playbook.id),
  );

  // Show empty state if all playbooks have the entry installed
  if (
    playbooks &&
    playbooks.length > 0 &&
    entryInstalledOn.length === playbooks.length
  ) {
    return (
      <EmptyState>
        <EmptyStateDescription>
          This MCP has already been installed on all your playbooks.
        </EmptyStateDescription>
      </EmptyState>
    );
  }

  const schema = z.object({
    ...(availablePlaybooks &&
      availablePlaybooks.length > 0 && { playbookId: z.string() }),
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

  const defaultValues = {
    ...(availablePlaybooks &&
      availablePlaybooks.length > 0 && {
        playbookId: defaultPlaybookId ?? availablePlaybooks[0]?.id ?? "",
      }),
    parameters: parameters.reduce(
      (acc, param) => {
        acc[param.name] = "";
        return acc;
      },
      {} as Record<string, string>,
    ),
  };

  return (
    <FormWithSchema
      schema={schema}
      defaultValues={defaultValues}
      className="gap-y-0 overflow-hidden rounded-xl bg-accent-subtle shadow-[0_0_0_0.5px_rgba(55,50,46,0.15)]"
      onSubmit={(values) => {
        onSubmit({
          playbookId:
            availablePlaybooks && availablePlaybooks.length > 0
              ? (values as { playbookId?: string }).playbookId
              : undefined,
          entryId: registryEntry.id as unknown as string,
          parameters: values.parameters,
        });
      }}
    >
      <div className="flex flex-col gap-y-4 p-4">
        {availablePlaybooks && availablePlaybooks.length > 0 && (
          <SelectNativeField name="playbookId" label="Select a playbook">
            {availablePlaybooks.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name}
              </option>
            ))}
          </SelectNativeField>
        )}
        {parameters.map((param) => (
          <InputField
            type={param.password ? "password" : "text"}
            key={param.name}
            name={`parameters.${param.name}`}
            label={param.name}
            helperLabel={!param.required ? "Optional" : undefined}
            description={<SimpleMarkdown>{param.description}</SimpleMarkdown>}
            autoCorrect="off"
            spellCheck={false}
          />
        ))}
      </div>

      <div className="border-fg/7 border-t-[0.5px] bg-accent px-4 py-2.5">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Installing..." : "Add to playbook"}
        </Button>
        {onClickCancel && (
          <Button
            className="mt-2 w-full bg-surface/50"
            variant="secondary"
            onClick={onClickCancel}
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </Button>
        )}
      </div>
    </FormWithSchema>
  );
}

import { z } from "zod";
import type { MasterRegistryEntry, StoreGetAll } from "../types";
import { Button } from "../ui/button";
import { EmptyState, EmptyStateDescription } from "../ui/empty-state";
import { FormWithSchema } from "../ui/form";
import { InputField } from "../ui/form/input-field";
import { SelectNativeField } from "../ui/form/select-native-field";
import { SimpleMarkdown } from "../ui/markdown";

interface RegistryInstallFormProps {
  registryEntry: Pick<MasterRegistryEntry, "name" | "id" | "parameters">;
  proxies?: StoreGetAll;
  defaultProxyId?: string;
  entryInstalledOn?: string[];
  onSubmit: (params: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function RegistryInstallForm({
  registryEntry,
  proxies,
  defaultProxyId,
  entryInstalledOn = [],
  onSubmit,
  isSubmitting = false,
}: RegistryInstallFormProps) {
  const parameters = (registryEntry.parameters ?? []).filter(
    (parameter, index, array) =>
      array.findIndex((p) => p.name === parameter.name) === index,
  );

  // Filter out proxies where the entry is already installed
  const availableProxies = proxies?.filter(
    (proxy) => !entryInstalledOn.includes(proxy.id),
  );

  // Show empty state if all proxies have the entry installed
  if (
    proxies &&
    proxies.length > 0 &&
    entryInstalledOn.length === proxies.length
  ) {
    return (
      <EmptyState>
        <EmptyStateDescription>
          This MCP has already been installed on all your proxies.
        </EmptyStateDescription>
      </EmptyState>
    );
  }

  const schema = z.object({
    ...(availableProxies &&
      availableProxies.length > 0 && { proxyId: z.string() }),
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
    ...(availableProxies &&
      availableProxies.length > 0 && {
        proxyId: defaultProxyId ?? availableProxies[0]?.id ?? "",
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
          proxyId:
            availableProxies && availableProxies.length > 0
              ? (values as { proxyId?: string }).proxyId
              : undefined,
          entryId: registryEntry.id as unknown as string,
          parameters: values.parameters,
        });
      }}
    >
      <div className="flex flex-col gap-y-4 p-4">
        {availableProxies && availableProxies.length > 0 && (
          <SelectNativeField name="proxyId" label="Select a proxy">
            {availableProxies.map((it) => (
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
          {isSubmitting ? "Installing..." : "Add to proxy"}
        </Button>
      </div>
    </FormWithSchema>
  );
}

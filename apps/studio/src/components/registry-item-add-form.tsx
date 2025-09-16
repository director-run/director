import { RegistryInstallForm } from "./registry/registry-install-form";
import type { MasterRegistryEntry, StoreGetAll } from "./types";
import { Badge, BadgeGroup, BadgeLabel } from "./ui/badge";
import { EmptyState, EmptyStateDescription } from "./ui/empty-state";
import { Section, SectionHeader, SectionTitle } from "./ui/section";

interface RegistryItemAddFormProps {
  entry: Pick<MasterRegistryEntry, "name" | "id">;
  proxies?: StoreGetAll;
  entryInstalledOn?: string[];
  onClickInstall: (params: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void>;
  isInstalling?: boolean;
}

export function RegistryItemAddForm({
  entry,
  proxies,
  entryInstalledOn = [],
  onClickInstall,
  isInstalling = false,
}: RegistryItemAddFormProps) {
  return (
    <>
      {entryInstalledOn.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle variant="h3" asChild>
              <h3>Installed on</h3>
            </SectionTitle>
          </SectionHeader>
          <BadgeGroup>
            {entryInstalledOn.map((proxyId) => {
              return (
                <Badge key={proxyId} className="cursor-pointer">
                  <BadgeLabel>{proxyId}</BadgeLabel>
                </Badge>
              );
            })}
          </BadgeGroup>
        </Section>
      )}

      <Section>
        <SectionHeader>
          <SectionTitle variant="h3" asChild>
            <h3>Add to proxy</h3>
          </SectionTitle>
        </SectionHeader>

        {proxies &&
        proxies.length > 0 &&
        entryInstalledOn.length === proxies.length ? (
          <EmptyState>
            <EmptyStateDescription>
              This MCP has already been installed on all your proxies.
            </EmptyStateDescription>
          </EmptyState>
        ) : (
          <RegistryInstallForm
            mcp={entry as MasterRegistryEntry}
            proxies={proxies?.filter(
              (proxy) => !entryInstalledOn.includes(proxy.id),
            )}
            onSubmit={async (values) =>
              onClickInstall({
                proxyId: values.proxyId,
                entryId: entry.id as unknown as string,
                parameters: values.parameters,
              })
            }
            isSubmitting={isInstalling}
          />
        )}
      </Section>
    </>
  );
}

import { RegistryInstallForm } from "./registry/registry-install-form";
import type { MasterRegistryEntry, StoreGetAll } from "./types";
import { Badge, BadgeGroup, BadgeLabel } from "./ui/badge";
import { EmptyState, EmptyStateDescription } from "./ui/empty-state";
import { Section, SectionHeader, SectionTitle } from "./ui/section";

interface RegistryItemAddFormProps {
  entry: Pick<MasterRegistryEntry, "name">;
  proxiesWithMcp: StoreGetAll;
  proxiesWithoutMcp: StoreGetAll;
  defaultProxyId?: string;
  onInstall: (values: {
    proxyId: string;
    parameters: Record<string, string>;
  }) => Promise<void>;
  isInstalling?: boolean;
  onProxyServerClick?: (proxyId: string, serverName: string) => void;
}

export function RegistryItemAddForm({
  entry,
  proxiesWithMcp,
  proxiesWithoutMcp,
  defaultProxyId,
  onInstall,
  isInstalling = false,
  onProxyServerClick,
}: RegistryItemAddFormProps) {
  return (
    <>
      {proxiesWithMcp.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle variant="h3" asChild>
              <h3>Installed on</h3>
            </SectionTitle>
          </SectionHeader>
          <BadgeGroup>
            {proxiesWithMcp.map((proxy) => {
              return (
                <Badge
                  key={proxy.id}
                  onClick={() => onProxyServerClick?.(proxy.id, entry.name)}
                  className="cursor-pointer"
                >
                  <BadgeLabel>{proxy.name}</BadgeLabel>
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
        {proxiesWithoutMcp.length > 0 ? (
          <RegistryInstallForm
            mcp={entry as MasterRegistryEntry}
            proxies={proxiesWithoutMcp}
            defaultProxyId={defaultProxyId}
            onSubmit={onInstall}
            isSubmitting={isInstalling}
          />
        ) : (
          <EmptyState>
            <EmptyStateDescription>
              This MCP has already been installed on all your proxies.
            </EmptyStateDescription>
          </EmptyState>
        )}
      </Section>
    </>
  );
}

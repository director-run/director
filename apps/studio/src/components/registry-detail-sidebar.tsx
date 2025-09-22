import { RegistryInstallForm } from "./registry/registry-install-form";
import type { RegistryEntryDetail, WorkspaceList } from "./types";
import { Badge, BadgeGroup, BadgeLabel } from "./ui/badge";
import { Section, SectionHeader, SectionTitle } from "./ui/section";

interface RegistryDetailSidebarProps {
  entry: Pick<RegistryEntryDetail, "name" | "id" | "parameters">;
  proxies?: WorkspaceList;
  onClickInstall: (params: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void>;
  onClickCancel?: () => void;
  isInstalling?: boolean;
}

export function RegistryDetailSidebar({
  entry,
  proxies,
  onClickInstall,
  onClickCancel,
  isInstalling = false,
}: RegistryDetailSidebarProps) {
  const entryInstalledOn = (proxies ?? [])
    .filter((proxy) => proxy.servers.some((it) => it.name === entry.name))
    .map((p) => p.id);
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

        <RegistryInstallForm
          registryEntry={entry}
          proxies={proxies}
          onSubmit={onClickInstall}
          isSubmitting={isInstalling}
          onClickCancel={onClickCancel}
        />
      </Section>
    </>
  );
}

import { RegistryInstallForm } from "./registry/registry-install-form";
import type { MasterRegistryEntry, StoreGetAll } from "./types";
import { Badge, BadgeGroup, BadgeLabel } from "./ui/badge";
import { Section, SectionHeader, SectionTitle } from "./ui/section";

interface RegistryDetailSidebarProps {
  entry: Pick<MasterRegistryEntry, "name" | "id" | "parameters">;
  proxies?: StoreGetAll;
  entryInstalledOn?: string[];
  onClickInstall: (params: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void>;
  isInstalling?: boolean;
}

export function RegistryDetailSidebar({
  entry,
  proxies,
  entryInstalledOn = [],
  onClickInstall,
  isInstalling = false,
}: RegistryDetailSidebarProps) {
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
          entryInstalledOn={entryInstalledOn}
          onSubmit={onClickInstall}
          isSubmitting={isInstalling}
        />
      </Section>
    </>
  );
}

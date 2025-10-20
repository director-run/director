import { RegistryInstallForm } from "./registry/registry-install-form";
import type { PlaybookList, RegistryEntryDetail } from "./types";
import { Badge, BadgeGroup, BadgeLabel } from "./ui/badge";
import { Section, SectionHeader, SectionTitle } from "./ui/section";

interface RegistryDetailSidebarProps {
  entry: Pick<RegistryEntryDetail, "name" | "id" | "parameters">;
  playbooks?: PlaybookList;
  onClickInstall: (params: {
    playbookId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void> | void;
  onClickCancel?: () => void;
  isInstalling?: boolean;
}

export function RegistryDetailSidebar({
  entry,
  playbooks,
  onClickInstall,
  onClickCancel,
  isInstalling = false,
}: RegistryDetailSidebarProps) {
  const entryInstalledOn = (playbooks ?? [])
    .filter((playbook) => playbook.servers.some((it) => it.name === entry.name))
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
            {entryInstalledOn.map((playbookId) => {
              return (
                <Badge key={playbookId} className="cursor-pointer">
                  <BadgeLabel>{playbookId}</BadgeLabel>
                </Badge>
              );
            })}
          </BadgeGroup>
        </Section>
      )}

      <Section>
        <SectionHeader>
          <SectionTitle variant="h3" asChild>
            <h3>Add to playbook</h3>
          </SectionTitle>
        </SectionHeader>

        <RegistryInstallForm
          registryEntry={entry}
          playbooks={playbooks}
          onSubmit={onClickInstall}
          isSubmitting={isInstalling}
          onClickCancel={onClickCancel}
        />
      </Section>
    </>
  );
}

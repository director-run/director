import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { RegistryItem } from "../registry-item";
import { RegistryInstallForm } from "../registry/registry-install-form";
import { SplitView, SplitViewMain, SplitViewSide } from "../split-view";
import type { PlaybookList, RegistryEntryDetail } from "../types";
import { Container } from "../ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

type GetStartedInstallServerDialogProps = {
  registryEntry?: RegistryEntryDetail | null;
  playbooks?: PlaybookList;
  onClickInstall: (params: {
    playbookId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void>;
  isInstalling: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function GetStartedInstallServerDialogPresentation({
  registryEntry,
  playbooks,
  onClickInstall,
  isInstalling,
  open,
  onOpenChange,
}: GetStartedInstallServerDialogProps) {
  const mcp = registryEntry;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none !inset-1 !translate-0 !w-auto flex flex-col py-10">
        <VisuallyHidden>
          <DialogTitle className="pt-4">Install {mcp?.title}</DialogTitle>
          <DialogDescription>{mcp?.description}</DialogDescription>
        </VisuallyHidden>
        <Container size="xl">
          <SplitView>
            <SplitViewMain>{mcp && <RegistryItem entry={mcp} />}</SplitViewMain>
            <SplitViewSide>
              <div className="sticky top-0 flex flex-col gap-y-8">
                <Section>
                  <SectionHeader>
                    <SectionTitle variant="h3" asChild>
                      <h3>Add to playbook</h3>
                    </SectionTitle>
                  </SectionHeader>
                  {mcp && (
                    <RegistryInstallForm
                      registryEntry={mcp}
                      playbooks={playbooks}
                      onSubmit={onClickInstall}
                      isSubmitting={isInstalling}
                      onClickCancel={() => onOpenChange(false)}
                    />
                  )}
                </Section>
              </div>
            </SplitViewSide>
          </SplitView>
        </Container>

        {/* Mobile version */}
        <div className="-bottom-5 sticky inset-x-0 px-4 pt-4 md:hidden">
          <div className="rounded-xl bg-accent-subtle p-4 shadow-[0_0_0_0.5px_rgba(55,50,46,0.2)]">
            {mcp && (
              <RegistryInstallForm
                registryEntry={mcp}
                playbooks={playbooks}
                onSubmit={onClickInstall}
                isSubmitting={isInstalling}
                onClickCancel={() => onOpenChange(false)}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main dialog component - presentational only
export function GetStartedInstallServerDialog({
  registryEntry,
  playbooks,
  onClickInstall,
  isInstalling,
  open,
  onOpenChange,
}: GetStartedInstallServerDialogProps) {
  return (
    <GetStartedInstallServerDialogPresentation
      registryEntry={registryEntry}
      playbooks={playbooks}
      onClickInstall={onClickInstall}
      isInstalling={isInstalling}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

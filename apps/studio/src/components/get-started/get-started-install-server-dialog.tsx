import {
  ArrowSquareOutIcon,
  BookOpenTextIcon,
  HardDriveIcon,
  SealCheckIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { McpLogo } from "../mcp-logo";
import { McpDescriptionList } from "../mcp-servers/mcp-description-list";
import { RegistryParameters } from "../registry/registry-parameters";
import { RegistryTools } from "../registry/registry-tools";
import type { RegistryEntryDetail } from "../types";
import { Badge, BadgeGroup, BadgeIcon, BadgeLabel } from "../ui/badge";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { EmptyState, EmptyStateTitle } from "../ui/empty-state";
import { Markdown } from "../ui/markdown";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type GetStartedInstallServerDialogProps = {
  registryEntry?: RegistryEntryDetail | null;
  isRegistryEntryLoading?: boolean;
  onClickInstall: () => void;
  isInstalling: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Presentational component - no state management or tRPC calls
function GetStartedInstallServerDialogPresentation({
  registryEntry,
  isRegistryEntryLoading,
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
          <div className="flex flex-row gap-x-8">
            <div className="flex min-w-0 grow flex-col gap-y-12 md:gap-y-16">
              <Section className="gap-y-8">
                {mcp && <McpLogo src={mcp.icon} className="size-9" />}
                <SectionHeader>
                  <SectionTitle>{mcp?.title}</SectionTitle>
                  <SectionDescription>{mcp?.description}</SectionDescription>
                </SectionHeader>

                <BadgeGroup>
                  {mcp?.isOfficial && (
                    <Badge variant="success">
                      <BadgeIcon>
                        <SealCheckIcon />
                      </BadgeIcon>
                      <BadgeLabel uppercase>Official</BadgeLabel>
                    </Badge>
                  )}

                  {mcp?.homepage && (
                    <Badge
                      className="transition-opacity duration-200 hover:opacity-50"
                      asChild
                    >
                      <a
                        href={mcp.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BadgeIcon>
                          <ArrowSquareOutIcon weight="bold" />
                        </BadgeIcon>
                        <BadgeLabel uppercase>Homepage</BadgeLabel>
                      </a>
                    </Badge>
                  )}
                </BadgeGroup>
              </Section>

              <Tabs defaultValue="readme">
                <TabsList>
                  <TabsTrigger value="readme">
                    <BookOpenTextIcon /> Readme
                  </TabsTrigger>
                  <TabsTrigger value="tools">
                    <ToolboxIcon /> Tools
                  </TabsTrigger>
                  <TabsTrigger value="transport">
                    <HardDriveIcon /> Transport
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="readme">
                  {mcp?.readme ? (
                    <Markdown className="!max-w-none rounded-xl border-[0.5px] bg-accent-subtle/20 p-6">
                      {mcp.readme}
                    </Markdown>
                  ) : (
                    <EmptyState>
                      <EmptyStateTitle>No readme found</EmptyStateTitle>
                    </EmptyState>
                  )}
                </TabsContent>

                <TabsContent
                  value="tools"
                  className="rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
                >
                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Tools</h3>
                      </SectionTitle>
                    </SectionHeader>
                    <RegistryTools links={[]} />
                  </Section>
                </TabsContent>

                <TabsContent
                  value="transport"
                  className="flex flex-col gap-y-10 rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
                >
                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Overview</h3>
                      </SectionTitle>
                    </SectionHeader>
                    {mcp && <McpDescriptionList transport={mcp.transport} />}
                  </Section>

                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Parameters</h3>
                      </SectionTitle>
                    </SectionHeader>
                    <RegistryParameters parameters={mcp?.parameters ?? []} />
                  </Section>
                </TabsContent>
              </Tabs>
            </div>
            <div className="hidden w-xs shrink-0 flex-col md:flex">
              <div className="sticky top-0 flex flex-col gap-y-8">
                <Section>
                  <SectionHeader>
                    <SectionTitle variant="h3" asChild>
                      <h3>Add to proxy</h3>
                    </SectionTitle>
                  </SectionHeader>
                  <div className="rounded-xl bg-accent-subtle p-4 shadow-[0_0_0_0.5px_rgba(55,50,46,0.2)]">
                    <Button
                      className="w-full"
                      onClick={onClickInstall}
                      disabled={isInstalling || isRegistryEntryLoading}
                    >
                      {isInstalling ? "Installing..." : "Add to proxy"}
                    </Button>
                    <DialogClose asChild>
                      <Button
                        className="mt-2 w-full bg-surface/50"
                        variant="secondary"
                        disabled={isInstalling}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </Container>
        <div className="-bottom-5 sticky inset-x-0 px-4 pt-4 md:hidden">
          <div className="rounded-xl bg-accent-subtle p-4 shadow-[0_0_0_0.5px_rgba(55,50,46,0.2)]">
            <Button
              className="w-full"
              onClick={onClickInstall}
              disabled={isInstalling || isRegistryEntryLoading}
            >
              {isInstalling ? "Installing..." : "Add to proxy"}
            </Button>
            <DialogClose asChild>
              <Button
                className="mt-2 w-full bg-surface/50"
                variant="secondary"
                disabled={isInstalling}
              >
                Cancel
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main dialog component - presentational only
export function GetStartedInstallServerDialog({
  registryEntry,
  isRegistryEntryLoading,
  onClickInstall,
  isInstalling,
  open,
  onOpenChange,
}: GetStartedInstallServerDialogProps) {
  return (
    <GetStartedInstallServerDialogPresentation
      registryEntry={registryEntry}
      isRegistryEntryLoading={isRegistryEntryLoading}
      onClickInstall={onClickInstall}
      isInstalling={isInstalling}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

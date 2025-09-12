import { McpLogo } from "@/components/mcp-logo";
import { McpDescriptionList } from "@/components/mcp-servers/mcp-description-list";
import { RegistryInstallForm } from "@/components/registry/registry-install-form";
import { RegistryParameters } from "@/components/registry/registry-parameters";
import { RegistryToolSheet } from "@/components/registry/registry-tool-sheet";
import { RegistryTools } from "@/components/registry/registry-tools";
import { RegistryGetEntryByName, StoreGetAll } from "@/components/types";
import {
  Badge,
  BadgeGroup,
  BadgeIcon,
  BadgeLabel,
} from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { Markdown } from "@/components/ui/markdown";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowSquareOutIcon,
  BookOpenTextIcon,
  HardDriveIcon,
  SealCheckIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";

interface RegistryItemDetailProps {
  entry: RegistryGetEntryByName;
  proxiesWithMcp: StoreGetAll;
  proxiesWithoutMcp: StoreGetAll;
  selectedTool?: NonNullable<RegistryGetEntryByName["tools"]>[number];
  defaultProxyId?: string;
  serverId: string | null;
  onInstall: (values: {
    proxyId: string;
    parameters: Record<string, string>;
  }) => Promise<void>;
  isInstalling?: boolean;
  onCloseTool: () => void;
  toolLinks: Array<{
    title: string;
    subtitle: string;
    scroll: boolean;
    href: string;
  }>;
  onProxyServerClick?: (proxyId: string, serverName: string) => void;
  onLibraryClick?: () => void;
  onMcpClick?: (mcpId: string) => void;
}

export function RegistryItemDetail({
  entry,
  proxiesWithMcp,
  proxiesWithoutMcp,
  selectedTool,
  defaultProxyId,
  serverId,
  onInstall,
  isInstalling = false,
  onCloseTool,
  toolLinks,
  onProxyServerClick,
  onLibraryClick,
  onMcpClick,
}: RegistryItemDetailProps) {
  return (
    <>
      <Container size="xl">
        <div className="flex flex-row gap-x-8">
          <div className="flex min-w-0 grow flex-col gap-y-12 lg:gap-y-16">
            <Section className="gap-y-8">
              <McpLogo src={entry.icon} className="size-9" />
              <SectionHeader>
                <SectionTitle>{entry.title}</SectionTitle>
                <SectionDescription>{entry.description}</SectionDescription>
              </SectionHeader>

              <BadgeGroup>
                {entry.isOfficial && (
                  <Badge variant="success">
                    <BadgeIcon>
                      <SealCheckIcon />
                    </BadgeIcon>
                    <BadgeLabel uppercase>Official</BadgeLabel>
                  </Badge>
                )}

                {entry.homepage && (
                  <Badge
                    className="transition-opacity duration-200 hover:opacity-50"
                    asChild
                  >
                    <a
                      href={entry.homepage}
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
                {entry.readme ? (
                  <Markdown className="!max-w-none rounded-xl border-[0.5px] bg-accent-subtle/20 p-6">
                    {entry.readme}
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
                  <RegistryTools links={toolLinks} />
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
                  <McpDescriptionList transport={entry.transport} />
                </Section>

                <Section>
                  <SectionHeader>
                    <SectionTitle variant="h2" asChild>
                      <h3>Parameters</h3>
                    </SectionTitle>
                  </SectionHeader>
                  <RegistryParameters parameters={entry.parameters ?? []} />
                </Section>
              </TabsContent>
            </Tabs>
          </div>
          <div className="hidden w-xs shrink-0 flex-col lg:flex">
            <div className="sticky top-0 flex flex-col gap-y-8">
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
                          onClick={() =>
                            onProxyServerClick?.(proxy.id, entry.name)
                          }
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
                    mcp={entry}
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
            </div>
          </div>
        </div>
      </Container>
      {selectedTool && (
        <RegistryToolSheet
          tool={selectedTool}
          mcpName={entry.title}
          mcpId={entry.name}
          onClose={onCloseTool}
          onLibraryClick={onLibraryClick}
          onMcpClick={onMcpClick}
        />
      )}
    </>
  );
}

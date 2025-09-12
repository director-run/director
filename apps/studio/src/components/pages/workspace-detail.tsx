import {
  MCPLinkCard,
  MCPLinkCardList,
} from "@/components/mcp-servers/mcp-link-card";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import {
  AvailableClient,
  Client,
  ProxyInstallers,
} from "@/components/proxies/proxy-installers";
import { ProxyManualDialog } from "@/components/proxies/proxy-manual-dialog";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { toast } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { ConfiguratorTarget } from "@director.run/client-configurator/index";

interface ProxyDetailProps {
  proxy: {
    id: string;
    name: string;
    description?: string;
    servers: Array<{
      name: string;
    }>;
  };
  clients: Client[];
  installers: Record<string, boolean>;
  availableClients: AvailableClient[];
  isClientsLoading: boolean;
  onInstall: (proxyId: string, client: ConfiguratorTarget) => void;
  onUninstall: (proxyId: string, client: ConfiguratorTarget) => void;
  isInstalling: boolean;
  isUninstalling: boolean;
  toolLinks: Array<{
    title: string;
    subtitle: string;
    scroll: boolean;
    href: string;
    badges?: React.ReactNode;
  }>;
  toolsLoading: boolean;
  onLibraryClick?: () => void;
  onServerClick?: (serverId: string) => void;
}

export function ProxyDetail({
  proxy,
  clients,
  installers,
  availableClients,
  isClientsLoading,
  onInstall,
  onUninstall,
  isInstalling,
  isUninstalling,
  toolLinks,
  toolsLoading,
  onLibraryClick,
  onServerClick,
}: ProxyDetailProps) {
  const [_, copy] = useCopyToClipboard();

  const handleCopy = async (text: string) => {
    await copy(text);
    toast({
      title: "Copied to clipboard",
      description: "The endpoint has been copied to your clipboard.",
    });
  };
  return (
    <Container size="lg">
      <Section>
        <SectionHeader>
          <SectionTitle>{proxy.name}</SectionTitle>
          <SectionDescription>{proxy.description}</SectionDescription>
        </SectionHeader>
      </Section>

      <SectionSeparator />

      <Section>
        <SectionHeader className="flex flex-row items-center justify-between">
          <SectionTitle variant="h2" asChild>
            <h2>Clients</h2>
          </SectionTitle>
          <ProxyManualDialog proxyId={proxy.id} onCopy={handleCopy}>
            <Button size="sm">Connect manually</Button>
          </ProxyManualDialog>
        </SectionHeader>
        <ProxyInstallers
          proxyId={proxy.id}
          clients={clients}
          installers={installers}
          availableClients={availableClients}
          isLoading={isClientsLoading}
          onInstall={onInstall}
          onUninstall={onUninstall}
          isInstalling={isInstalling}
          isUninstalling={isUninstalling}
        />
      </Section>

      <SectionSeparator />

      <Section>
        <SectionHeader className="flex flex-row items-center justify-between">
          <SectionTitle variant="h2" asChild>
            <h2>MCP Servers</h2>
          </SectionTitle>
          <Button size="sm" onClick={onLibraryClick}>
            Add MCP server
          </Button>
        </SectionHeader>
        <MCPLinkCardList>
          {proxy.servers.map((it) => {
            return (
              <MCPLinkCard
                key={it.name}
                entry={{
                  title: it.name,
                  description: null,
                  icon: null,
                  isOfficial: false,
                }}
                onClick={() => onServerClick?.(it.name)}
              />
            );
          })}
        </MCPLinkCardList>
      </Section>

      <SectionSeparator />

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h2>Tools</h2>
          </SectionTitle>
        </SectionHeader>
        <McpToolsTable links={toolLinks} isLoading={toolsLoading} />
      </Section>
    </Container>
  );
}

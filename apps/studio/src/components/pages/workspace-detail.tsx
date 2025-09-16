import type { AvailableClient, Client } from "../proxies/proxy-installers";
import { WorkspaceSectionClients } from "../proxies/workspace-section-clients";
import { WorkspaceSectionHeader } from "../proxies/workspace-section-header";
import { WorkspaceSectionServers } from "../proxies/workspace-section-servers";
import { WorkspaceSectionTools } from "../proxies/workspace-section-tools";
import { ConfiguratorTarget, type MasterWorkspace } from "../types";
import { Container } from "../ui/container";
import { SectionSeparator } from "../ui/section";

interface WorkspaceDetailProps {
  workspace: MasterWorkspace;
  gatewayBaseUrl: string;
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

export function WorkspaceDetail({
  workspace,
  gatewayBaseUrl,
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
}: WorkspaceDetailProps) {
  return (
    <Container size="lg">
      <WorkspaceSectionHeader workspace={workspace} />

      <SectionSeparator />

      <WorkspaceSectionClients
        workspaceId={workspace.id}
        gatewayBaseUrl={gatewayBaseUrl}
        clients={clients}
        installers={installers}
        availableClients={availableClients}
        isClientsLoading={isClientsLoading}
        onInstall={onInstall}
        onUninstall={onUninstall}
        isInstalling={isInstalling}
        isUninstalling={isUninstalling}
      />

      <SectionSeparator />

      <WorkspaceSectionServers
        workspace={workspace}
        onLibraryClick={onLibraryClick}
        onServerClick={onServerClick}
      />

      <SectionSeparator />

      <WorkspaceSectionTools
        toolLinks={toolLinks}
        toolsLoading={toolsLoading}
      />
    </Container>
  );
}

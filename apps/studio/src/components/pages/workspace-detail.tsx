import type {} from "../proxies/proxy-installers";
import {
  WorkspaceSectionClients,
  type WorkspaceSectionClientsProps,
} from "../proxies/workspace-section-clients";
import {
  WorkspaceSectionHeader,
  type WorkspaceSectionHeaderProps,
} from "../proxies/workspace-section-header";
import {
  WorkspaceSectionServers,
  type WorkspaceSectionServersProps,
} from "../proxies/workspace-section-servers";
import {
  WorkspaceSectionTools,
  type WorkspaceSectionToolsProps,
} from "../proxies/workspace-section-tools";
import { Container } from "../ui/container";
import { SectionSeparator } from "../ui/section";

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
}: WorkspaceSectionClientsProps &
  WorkspaceSectionHeaderProps &
  WorkspaceSectionServersProps &
  WorkspaceSectionToolsProps) {
  return (
    <Container size="lg">
      <WorkspaceSectionHeader workspace={workspace} />

      <SectionSeparator />

      <WorkspaceSectionClients
        workspace={workspace}
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

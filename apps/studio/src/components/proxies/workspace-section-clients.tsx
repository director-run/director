import { ConfiguratorTarget } from "../types";
import { Button } from "../ui/button";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import type { AvailableClient, Client } from "./proxy-installers";
import { ProxyInstallers } from "./proxy-installers";
import { ProxyManualDialog } from "./proxy-manual-dialog";

interface WorkspaceSectionClientsProps {
  workspaceId: string;
  gatewayBaseUrl: string;
  clients: Client[];
  installers: Record<string, boolean>;
  availableClients: AvailableClient[];
  isClientsLoading: boolean;
  onInstall: (proxyId: string, client: ConfiguratorTarget) => void;
  onUninstall: (proxyId: string, client: ConfiguratorTarget) => void;
  isInstalling: boolean;
  isUninstalling: boolean;
  onCopy: (text: string) => Promise<void>;
}

export function WorkspaceSectionClients({
  workspaceId,
  gatewayBaseUrl,
  clients,
  installers,
  availableClients,
  isClientsLoading,
  onInstall,
  onUninstall,
  isInstalling,
  isUninstalling,
  onCopy,
}: WorkspaceSectionClientsProps) {
  return (
    <Section>
      <SectionHeader className="flex flex-row items-center justify-between">
        <SectionTitle variant="h2" asChild>
          <h2>Clients</h2>
        </SectionTitle>
        <ProxyManualDialog
          proxyId={workspaceId}
          gatewayBaseUrl={gatewayBaseUrl}
          onCopy={onCopy}
        >
          <Button size="sm">Connect manually</Button>
        </ProxyManualDialog>
      </SectionHeader>
      <ProxyInstallers
        proxyId={workspaceId}
        gatewayBaseUrl={gatewayBaseUrl}
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
  );
}

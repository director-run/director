import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { ConfiguratorTarget } from "../types";
import type { WorkspaceDetail } from "../types";
import { Button } from "../ui/button";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import { toast } from "../ui/toast";
import type { AvailableClient, Client } from "./proxy-installers";
import { ProxyInstallers } from "./proxy-installers";
import { ProxyManualDialog } from "./proxy-manual-dialog";

export interface WorkspaceSectionClientsProps {
  workspace: WorkspaceDetail;
  gatewayBaseUrl: string;
  clients: Client[];
  installers: Record<string, boolean>;
  availableClients: AvailableClient[];
  isClientsLoading: boolean;
  onInstall: (proxyId: string, client: ConfiguratorTarget) => void;
  onUninstall: (proxyId: string, client: ConfiguratorTarget) => void;
  isInstalling: boolean;
  isUninstalling: boolean;
}

export function WorkspaceSectionClients({
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
}: WorkspaceSectionClientsProps) {
  const [_, copy] = useCopyToClipboard();

  const handleCopy = async (text: string) => {
    await copy(text);
    toast({
      title: "Copied to clipboard",
      description: "The endpoint has been copied to your clipboard.",
    });
  };
  return (
    <Section>
      <SectionHeader className="flex flex-row items-center justify-between">
        <SectionTitle variant="h2" asChild>
          <h2>Clients</h2>
        </SectionTitle>
        <ProxyManualDialog
          proxyId={workspace.id}
          gatewayBaseUrl={gatewayBaseUrl}
          onCopy={handleCopy}
        >
          <Button size="sm">Connect manually</Button>
        </ProxyManualDialog>
      </SectionHeader>
      <ProxyInstallers
        proxyId={workspace.id}
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

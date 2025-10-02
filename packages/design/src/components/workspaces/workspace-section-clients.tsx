import { cn } from "../../helpers/cn";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { ProxyManualDialog } from "../proxies/proxy-manual-dialog";
import { type Client, type ConfiguratorTarget } from "../types";
import type { WorkspaceDetail } from "../types";
import { Button } from "../ui/button";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import { Switch } from "../ui/switch";
import { toast } from "../ui/toast";

export interface WorkspaceSectionClientsProps {
  workspace: WorkspaceDetail;
  gatewayBaseUrl: string;
  clients: Client[];
  onChangeInstall: (client: ConfiguratorTarget, install: boolean) => void;
  isLoading: boolean;
}

export function WorkspaceSectionClients({
  workspace,
  gatewayBaseUrl,
  clients,
  onChangeInstall,
  isLoading,
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
        <SectionTitle variant="h3" asChild>
          <h3>Client connections</h3>
        </SectionTitle>
        <ProxyManualDialog
          proxyId={workspace.id}
          gatewayBaseUrl={gatewayBaseUrl}
          onCopy={handleCopy}
        >
          <Button size="sm">Connect manually</Button>
        </ProxyManualDialog>
      </SectionHeader>
      <div className="grid grid-cols-1 gap-2">
        {clients.map((client) => (
          <InstallerRow
            key={client.id}
            client={client}
            onChangeInstall={onChangeInstall}
            isLoading={isLoading}
          />
        ))}
      </div>
    </Section>
  );
}

function InstallerRow({
  client,
  onChangeInstall,
  isLoading,
}: {
  client: Client;
  onChangeInstall: (client: ConfiguratorTarget, install: boolean) => void;
  isLoading: boolean;
}) {
  return (
    <label
      htmlFor={client.id}
      className={cn(
        "flex cursor-pointer flex-row items-center justify-between rounded-lg bg-accent-subtle p-1 pr-2.5 transition-colors duration-200 ease-in-out hover:bg-accent",
        !client.installed &&
          "opacity-50 hover:cursor-not-allowed hover:bg-accent-subtle",
      )}
    >
      <div className="flex grow flex-row items-center gap-x-1">
        <img
          src={client.image}
          alt={`${client.label} icon`}
          height={32}
          width={32}
        />

        <span className="font-medium text-[15px]">{client.label}</span>
      </div>

      <Switch
        id={client.id}
        checked={!!client.present}
        onCheckedChange={(checked) => {
          onChangeInstall(client.id as ConfiguratorTarget, checked);
        }}
        disabled={isLoading || !client.installed}
      />
    </label>
  );
}

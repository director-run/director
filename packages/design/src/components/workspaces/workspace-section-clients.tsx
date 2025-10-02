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
      <ProxyInstallers
        clients={clients}
        isLoading={isLoading}
        onChangeInstall={onChangeInstall}
      />
    </Section>
  );
}

interface ProxyInstallersProps {
  clients: Client[];
  isLoading: boolean;
  onChangeInstall: (client: ConfiguratorTarget, install: boolean) => void;
}

function ProxyInstallers({
  clients,
  isLoading,
  onChangeInstall,
}: ProxyInstallersProps) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
      {clients.map((it) => (
        <label
          htmlFor={it.id}
          key={it.id}
          className={cn(
            "flex cursor-pointer flex-row items-center justify-between rounded-lg bg-accent-subtle p-1 pr-2.5 transition-colors duration-200 ease-in-out hover:bg-accent",
            !it.installed &&
              "opacity-50 hover:cursor-not-allowed hover:bg-accent-subtle",
          )}
        >
          <div className="flex grow flex-row items-center gap-x-1">
            <img
              src={it.image}
              alt={`${it.label} icon`}
              height={32}
              width={32}
            />

            <span className="font-medium text-[15px]">{it.label}</span>
          </div>

          <Switch
            id={it.id}
            checked={!!it.present}
            onCheckedChange={(checked) => {
              onChangeInstall(it.id as ConfiguratorTarget, checked);
            }}
            disabled={isLoading || !it.installed}
          />
        </label>
      ))}
    </div>
  );
}

import { cn } from "../../helpers/cn";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { type Client } from "../types";
import type { PlaybookDetail } from "../types";
import { Section, SectionHeader, SectionTitle } from "../ui/section";
import { Switch } from "../ui/switch";
import { toast } from "../ui/toast";
import {
  ManualInput,
  PlaybookManualDialog,
} from "./playbook-manual-connection-dialog";

export interface PlaybookSectionClientsProps {
  playbook: PlaybookDetail;
  gatewayBaseUrl: string;
  clients: Client[];
  onChangeInstall: (clientName: string, install: boolean) => void;
  isLoading: boolean;
}

export function PlaybookSectionClients({
  playbook,
  gatewayBaseUrl,
  clients,
  onChangeInstall,
  isLoading,
}: PlaybookSectionClientsProps) {
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
        <PlaybookManualDialog
          playbookId={playbook.id}
          gatewayBaseUrl={gatewayBaseUrl}
          onCopy={handleCopy}
        ></PlaybookManualDialog>
      </SectionHeader>
      <div className="overflow-hidden rounded-xl bg-accent-subtle p-4 shadow-[0_0_0_0.5px_rgba(55,50,46,0.15)]">
        <LittleLabel>Connect Automatically</LittleLabel>
        {clients.map((client) => (
          <InstallerRow
            key={client.id}
            client={client}
            onChangeInstall={onChangeInstall}
            isLoading={isLoading}
          />
        ))}
        <LittleLabel>Connect Manually</LittleLabel>

        <ManualInput
          id={playbook.id}
          gatewayBaseUrl={gatewayBaseUrl}
          onCopy={handleCopy}
        />
      </div>
    </Section>
  );
}

function LittleLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-medium font-mono text-[11px] uppercase leading-none tracking-widest peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </label>
  );
}

function InstallerRow({
  client,
  onChangeInstall,
  isLoading,
}: {
  client: Client;
  onChangeInstall: (clientName: string, install: boolean) => void;
  isLoading: boolean;
}) {
  return (
    <label
      htmlFor={client.id}
      className={cn(
        "flex cursor-pointer flex-row items-center justify-between rounded-lg bg-accent-subtle pt-2 pb-2 transition-colors duration-200 ease-in-out hover:bg-accent",
        !client.installed &&
          "opacity-50 hover:cursor-not-allowed hover:bg-accent-subtle",
      )}
    >
      <div className="flex grow flex-row items-center gap-x-1.5">
        <img
          src={client.image}
          alt={`${client.label} icon`}
          height={26}
          width={26}
        />

        <span className="font-medium text-[15px]">{client.label}</span>
      </div>

      <Switch
        id={client.id}
        checked={!!client.present}
        onCheckedChange={(checked) => {
          onChangeInstall(client.id, checked);
        }}
        disabled={isLoading || !client.installed}
      />
    </label>
  );
}

"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ListItemTitle } from "@/components/ui/list";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";

import { DIRECTOR_URL } from "@/lib/urls";
import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import claudeIconImage from "../../../public/icons/claude-icon.png";
import vscodeIconImage from "../../../public/icons/code-icon.png";
import cursorIconImage from "../../../public/icons/cursor-icon.png";

const clients = [
  {
    id: "claude",
    label: "Claude",
    image: claudeIconImage,
  },
  {
    id: "cursor",
    label: "Cursor",
    image: cursorIconImage,
  },
  {
    id: "vscode",
    label: "VSCode",
    image: vscodeIconImage,
  },
] as const;

type ClientId = (typeof clients)[number]["id"];

// tRPC types - using the actual return type from the query
type ClientStatus = {
  name: string;
  installed: boolean;
  configExists: boolean;
  configPath: string;
};

// Presentational component props
interface GetStartedInstallersViewProps {
  selectedClient: ClientId | undefined;
  onClientSelect: (client: ClientId) => void;
  availableClients: ClientStatus[];
  isLoading: boolean;
  isInstalling: boolean;
  onInstall: (client: ClientId) => void;
}

// Presentational component
function GetStartedInstallersView({
  selectedClient,
  onClientSelect,
  availableClients,
  isLoading,
  isInstalling,
  onInstall,
}: GetStartedInstallersViewProps) {
  return (
    <div className="flex flex-col gap-y-4 p-4">
      <ToggleGroupPrimitive.Root
        type="single"
        value={selectedClient}
        onValueChange={(value) => {
          onClientSelect(value as ClientId);
        }}
        className="group flex flex-row items-center justify-center gap-x-2"
      >
        {clients.map((it) => {
          const isAvailable = availableClients.some(
            (client) => client.name === it.id && client.installed,
          );

          return (
            <ToggleGroupPrimitive.Item
              key={it.id}
              value={it.id}
              className={cn(
                "group relative flex flex-1 flex-col items-center gap-y-1 overflow-hidden rounded-lg bg-accent p-3",
                "cursor-pointer hover:bg-accent-subtle",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent",
                "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-surface",
                "focus-visible:bg-accent-subtle focus-visible:ring-accent",
                "radix-state-[on]:ring-fg",
              )}
              disabled={isInstalling || isLoading || !isAvailable}
            >
              <Image src={it.image} alt="Claude" width={64} height={64} />
              <ListItemTitle className="font-[450] text-fg/80 capitalize">
                {it.label}
              </ListItemTitle>
            </ToggleGroupPrimitive.Item>
          );
        })}
      </ToggleGroupPrimitive.Root>
      <Button
        className="self-end"
        disabled={!selectedClient || isInstalling}
        onClick={() => {
          if (!selectedClient) {
            return;
          }
          onInstall(selectedClient);
        }}
      >
        {isInstalling ? "Connecting…" : "Connect"}
      </Button>
    </div>
  );
}

// Smart component that manages state and tRPC calls
interface GetStartedInstallersProps {
  proxyId: string;
}

export function GetStartedInstallers({ proxyId }: GetStartedInstallersProps) {
  const [selectedClient, setSelectedClient] = useState<ClientId | undefined>(
    undefined,
  );

  const utils = trpc.useUtils();

  const listClientsQuery = trpc.installer.allClients.useQuery();

  const installationMutation = trpc.installer.byProxy.install.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy installed",
        description: `This proxy was successfully installed`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const availableClients = listClientsQuery.data ?? [];

  const handleInstall = (client: ClientId) => {
    installationMutation.mutate({
      proxyId,
      client: client as ConfiguratorTarget,
      baseUrl: DIRECTOR_URL,
    });
  };

  return (
    <GetStartedInstallersView
      selectedClient={selectedClient}
      onClientSelect={setSelectedClient}
      availableClients={availableClients}
      isLoading={listClientsQuery.isLoading}
      isInstalling={installationMutation.isPending}
      onInstall={handleInstall}
    />
  );
}

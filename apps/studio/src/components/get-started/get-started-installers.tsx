"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ListItemTitle } from "@/components/ui/list";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";

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

interface GetStartedInstallersProps {
  proxyId: string;
}

export function GetStartedInstallers({ proxyId }: GetStartedInstallersProps) {
  const [selectedClient, setSelectedClient] = useState<ClientId | undefined>(
    undefined,
  );
  const utils = trpc.useUtils();
  const installationMutation = trpc.installer.byProxy.install.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy installed",
        description: `This proxy was successfully installed`,
      });
    },
  });

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <ToggleGroupPrimitive.Root
        type="single"
        value={selectedClient}
        onValueChange={(value) => {
          setSelectedClient(value as ClientId);
        }}
        className="group flex flex-row items-center justify-center gap-x-2"
      >
        {clients.map((it) => {
          return (
            <ToggleGroupPrimitive.Item
              key={it.id}
              value={it.id}
              className={cn(
                "group relative flex flex-1 flex-col items-center gap-y-1 overflow-hidden rounded-lg bg-accent p-3",
                "cursor-pointer hover:bg-accent-subtle",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-surface",
                "focus-visible:bg-accent-subtle focus-visible:ring-accent",
                "radix-state-[on]:ring-fg",
              )}
              disabled={installationMutation.isPending}
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
        disabled={!selectedClient || installationMutation.isPending}
        onClick={() => {
          if (!selectedClient) {
            return;
          }

          installationMutation.mutate({
            proxyId,
            client: selectedClient,
            baseUrl: "http://localhost:3673",
          });
        }}
      >
        {installationMutation.isPending ? "Connecting…" : "Connect"}
      </Button>
    </div>
  );
}

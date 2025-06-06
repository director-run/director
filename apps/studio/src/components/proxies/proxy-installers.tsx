"use client";

import Image from "next/image";

import { toast } from "@/components/ui/toast";
import { useProxy } from "@/hooks/use-proxy";
import { trpc } from "@/trpc/client";
import { Switch } from "../ui/switch";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import claudeIconImage from "../../../public/icons/claude-icon.png";
import vscodeIconImage from "../../../public/icons/code-icon.png";
import cursorIconImage from "../../../public/icons/cursor-icon.png";
import gooseIconImage from "../../../public/icons/goose-icon.png";
import raycastIconImage from "../../../public/icons/raycast-icon.png";

const clients = [
  {
    id: "claude",
    label: "Claude",
    image: claudeIconImage,
    type: "installer",
  },
  {
    id: "cursor",
    label: "Cursor",
    image: cursorIconImage,
    type: "installer",
  },
  {
    id: "vscode",
    label: "VSCode",
    image: vscodeIconImage,
    type: "installer",
  },
  {
    id: "goose",
    label: "Goose",
    image: gooseIconImage,
    type: "deep-link",
  },
  {
    id: "raycast",
    label: "Raycast",
    image: raycastIconImage,
    type: "deep-link",
  },
] as const;

interface ProxyInstallersProps {
  proxyId: string;
}

export function ProxyInstallers({ proxyId }: ProxyInstallersProps) {
  const { installers } = useProxy(proxyId);

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

  const uninstallationMutation = trpc.installer.byProxy.uninstall.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy uninstalled",
        description: `This proxy was successfully uninstalled`,
      });
    },
  });

  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
      {clients.map((it) => {
        if (it.type === "deep-link") {
          const gooseUrl = `goose://extension?url=${encodeURIComponent(
            `http://localhost:3673/${proxyId}/sse`,
          )}&id=${proxyId}&name=director__${proxyId}`;

          const raycastUrl = `raycast://mcp/install?${encodeURIComponent(
            JSON.stringify({
              name: `director__${proxyId}`,
              type: "stdio",
              command: "npx",
              args: [
                "@director.run/cli http2stdio",
                `http://localhost:3673/${proxyId}/sse`,
              ],
            }),
          )}`;

          return (
            <a
              key={it.id}
              href={it.id === "goose" ? gooseUrl : raycastUrl}
              className="flex cursor-pointer flex-row items-center justify-between rounded-lg bg-accent-subtle p-1 pr-2.5 transition-colors duration-200 ease-in-out hover:bg-accent"
            >
              <div className="flex grow flex-row items-center gap-x-1">
                <Image
                  src={it.image}
                  alt={`${it.label} icon`}
                  height={32}
                  width={32}
                />

                <span className="font-medium text-[15px]">{it.label}</span>
              </div>

              <ArrowUpRightIcon
                weight="bold"
                className="size-5 text-fg-subtle/50"
              />
            </a>
          );
        }

        return (
          <label
            htmlFor={it.id}
            key={it.id}
            className="flex cursor-pointer flex-row items-center justify-between rounded-lg bg-accent-subtle p-1 pr-2.5 transition-colors duration-200 ease-in-out hover:bg-accent"
          >
            <div className="flex grow flex-row items-center gap-x-1">
              <Image
                src={it.image}
                alt={`${it.label} icon`}
                height={32}
                width={32}
              />

              <span className="font-medium text-[15px]">{it.label}</span>
            </div>

            <Switch
              id={it.id}
              checked={installers[it.id]}
              onCheckedChange={(checked) => {
                if (checked) {
                  installationMutation.mutate({
                    proxyId,
                    client: it.id,
                    baseUrl: "http://localhost:3673",
                  });
                } else {
                  uninstallationMutation.mutate({ proxyId, client: it.id });
                }
              }}
              disabled={
                installationMutation.isPending ||
                uninstallationMutation.isPending
              }
            />
          </label>
        );
      })}
    </div>
  );
}

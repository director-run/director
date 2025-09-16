import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { cn } from "../../helpers/cn";
import { ConfiguratorTarget } from "../types";
import { Switch } from "../ui/switch";

export interface Client {
  id: string;
  label: string;
  image: string;
  type: "installer" | "deep-link";
}

export interface AvailableClient {
  name: string;
  installed: boolean;
}

interface ProxyInstallersProps {
  proxyId: string;
  gatewayBaseUrl: string;
  clients: Client[];
  installers: Record<string, boolean>;
  availableClients: AvailableClient[];
  isLoading: boolean;
  onInstall: (proxyId: string, client: ConfiguratorTarget) => void;
  onUninstall: (proxyId: string, client: ConfiguratorTarget) => void;
  isInstalling: boolean;
  isUninstalling: boolean;
}

export function ProxyInstallers({
  proxyId,
  gatewayBaseUrl,
  clients,
  installers,
  availableClients,
  isLoading,
  onInstall,
  onUninstall,
  isInstalling,
  isUninstalling,
}: ProxyInstallersProps) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
      {clients.map((it) => {
        if (it.type === "deep-link") {
          const gooseUrl = `goose://extension?url=${encodeURIComponent(
            `${gatewayBaseUrl}/${proxyId}/sse`,
          )}&id=${proxyId}&name=director__${proxyId}`;

          const raycastUrl = `raycast://mcp/install?${encodeURIComponent(
            JSON.stringify({
              name: `director__${proxyId}`,
              type: "stdio",
              command: "npx",
              args: [
                "@director.run/cli http2stdio",
                `${gatewayBaseUrl}/${proxyId}/sse`,
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
                <img
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

        const isAvailable = availableClients.some(
          (client) => client.name === it.id && client.installed,
        );

        return (
          <label
            htmlFor={it.id}
            key={it.id}
            className={cn(
              "flex cursor-pointer flex-row items-center justify-between rounded-lg bg-accent-subtle p-1 pr-2.5 transition-colors duration-200 ease-in-out hover:bg-accent",
              !isAvailable &&
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
              checked={installers[it.id]}
              onCheckedChange={(checked) => {
                if (checked) {
                  onInstall(proxyId, it.id as ConfiguratorTarget);
                } else {
                  onUninstall(proxyId, it.id as ConfiguratorTarget);
                }
              }}
              disabled={
                isInstalling || isUninstalling || isLoading || !isAvailable
              }
            />
          </label>
        );
      })}
    </div>
  );
}

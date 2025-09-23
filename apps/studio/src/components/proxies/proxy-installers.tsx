import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { cn } from "../../helpers/cn";
import { ConfiguratorTarget } from "../types";
import { Switch } from "../ui/switch";

export interface Client {
  id: string;
  label: string;
  image: string;
  type: "installer" | "deep-link";
  // For installer-type clients only
  installed?: boolean; // whether the client app is available on the system
  present?: boolean; // whether the proxy is currently installed in that client
}

export interface AvailableClient {
  name: string;
  installed: boolean;
}

interface ProxyInstallersProps {
  proxyId: string;
  gatewayBaseUrl: string;
  clients: Client[];
  isLoading: boolean;
  onChangeInstall: (client: ConfiguratorTarget, install: boolean) => void;
  isChanging: boolean;
}

export function ProxyInstallers({
  proxyId,
  gatewayBaseUrl,
  clients,
  isLoading,
  onChangeInstall,
  isChanging,
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

        const isAvailable = !!it.installed;

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
              checked={!!it.present}
              onCheckedChange={(checked) => {
                onChangeInstall(it.id as ConfiguratorTarget, checked);
              }}
              disabled={isChanging || isLoading || !isAvailable}
            />
          </label>
        );
      })}
    </div>
  );
}

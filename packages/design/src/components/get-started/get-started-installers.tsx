import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { Children } from "react";
import { cn } from "../../helpers/cn";
import type { Client } from "../types.ts";
import { Button } from "../ui/button";
import { ListItemTitle } from "../ui/list";

// tRPC types - using the actual return type from the query
export type ClientStatus = {
  name: string;
  installed: boolean;
  configExists: boolean;
  configPath: string;
};

// Presentational component props
interface GetStartedInstallersProps {
  selectedClient: string | undefined;
  onClientSelect: (client: string) => void;
  clients: Client[];
  isLoading: boolean;
  isInstalling: boolean;
  onInstall: (client: string) => void;
}

// Presentational component
export function GetStartedInstallers({
  selectedClient,
  onClientSelect,
  clients,
  isLoading,
  isInstalling,
  onInstall,
}: GetStartedInstallersProps) {
  return (
    <div className="flex flex-col gap-y-4 p-4">
      <ToggleGroupPrimitive.Root
        type="single"
        value={selectedClient}
        onValueChange={(value) => {
          onClientSelect(value);
        }}
        className="group flex flex-row items-center justify-center gap-x-2"
      >
        {Children.toArray(
          clients.map((it) => {
            const isAvailable = it.installed;
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
                <img src={it.image} alt="Claude" width={64} height={64} />
                <ListItemTitle className="font-[450] text-fg/80 capitalize">
                  {it.label}
                </ListItemTitle>
              </ToggleGroupPrimitive.Item>
            );
          }),
        )}
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

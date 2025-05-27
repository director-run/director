"use client";

import { useState } from "react";

import {
  MenuItemIcon,
  MenuItemLabel,
} from "@/app/design/components/primitives";
import {
  Badge,
  BadgeGroup,
  BadgeIcon,
  BadgeLabel,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useProxy } from "@/hooks/use-proxy";
import { trpc } from "@/trpc/client";
import {
  BoxArrowDownIcon,
  CheckCircleIcon,
  CircleNotchIcon,
  CopyIcon,
  DotsThreeOutlineVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Input } from "../ui/input";
import {
  List,
  ListItem,
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "../ui/list";
import { SelectNative } from "../ui/select-native";

type TransportType = "http" | "sse" | "stdio";

function ManualInput({ id }: { id: string }) {
  const [_, copy] = useCopyToClipboard();
  const [transportType, setTransportType] = useState<TransportType>("http");

  const transports: Record<TransportType, string> = {
    http: `http://localhost:3673/${id}/mcp`,
    sse: `http://localhost:3673/${id}/sse`,
    stdio: `director http2stdio http://localhost:3673/${id}/sse`,
  };

  return (
    <div className="relative flex">
      <SelectNative
        value={transportType}
        onChange={(e) => setTransportType(e.target.value as TransportType)}
        className="h-10 rounded-r-none border-[0.5px] border-fg/20 bg-accent-subtle font-medium text-[13px] text-muted-foreground shadow-none ring-0 hover:text-foreground focus-visible:border-fg/30 focus-visible:ring-0"
      >
        <option value="http">HTTP</option>
        <option value="sse">SSE</option>
        <option value="stdio">STDIO</option>
      </SelectNative>
      <Input
        autoFocus
        className="-mx-px h-10 rounded-none border-[0.5px] border-fg/30 pr-0 font-medium font-mono text-[13px] shadow-none focus-visible:border-fg/30 focus-visible:ring-0"
        readOnly
        value={transports[transportType]}
      />
      <div className="flex size-10 shrink-0 items-center justify-center rounded-r-md border-[0.5px] border-fg/20 bg-accent-subtle">
        <Button
          size="icon"
          variant="ghost"
          onClick={async () => {
            await copy(transports[transportType]);
            toast({
              title: "Copied to clipboard",
              description: "The endpoint has been copied to your clipboard.",
            });
          }}
        >
          <CopyIcon />
        </Button>
      </div>
    </div>
  );
}

interface ProxyInstallersProps {
  proxyId: string;
}

export function ProxyInstallers({ proxyId }: ProxyInstallersProps) {
  const { installers } = useProxy(proxyId);

  return (
    <List>
      <ListItem>
        <ListItemDetails>
          <ListItemTitle>Claude</ListItemTitle>
          <ListItemDescription className="line-clamp-none">
            Claude is a next generation AI assistant built by Anthropic.
          </ListItemDescription>
        </ListItemDetails>

        <BadgeGroup>
          {installers.claude && (
            <Badge variant="success">
              <BadgeIcon>
                <CheckCircleIcon />
              </BadgeIcon>
              <BadgeLabel uppercase>Installed</BadgeLabel>
            </Badge>
          )}
          <ProxyInstallerDropdown
            proxyId={proxyId}
            client="claude"
            baseUrl="http://localhost:3673"
            installed={installers.claude}
          />
        </BadgeGroup>
      </ListItem>
      <ListItem>
        <ListItemDetails>
          <ListItemTitle>Cursor</ListItemTitle>
          <ListItemDescription className="line-clamp-none">
            Cursor is the best way to code with AI.
          </ListItemDescription>
        </ListItemDetails>
        <BadgeGroup>
          {installers.cursor && (
            <Badge variant="success">
              <BadgeIcon>
                <CheckCircleIcon />
              </BadgeIcon>
              <BadgeLabel uppercase>Installed</BadgeLabel>
            </Badge>
          )}
          <ProxyInstallerDropdown
            proxyId={proxyId}
            client="cursor"
            baseUrl="http://localhost:3673"
            installed={installers.cursor}
          />
        </BadgeGroup>
      </ListItem>
    </List>
  );
}

interface ProxyInstallerDropdownProps {
  proxyId: string;
  client: "claude" | "cursor";
  baseUrl: string;
  installed: boolean;
}

function ProxyInstallerDropdown({
  proxyId,
  client,
  baseUrl,
  installed,
}: ProxyInstallerDropdownProps) {
  const [showActions, setShowActions] = useState(false);

  const onSuccess = () => {
    setShowActions(false);
  };

  return (
    <DropdownMenu open={showActions} onOpenChange={setShowActions}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <DotsThreeOutlineVerticalIcon weight="fill" className="!size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-32">
        <DropdownMenuGroup>
          <ProxyInstallMenuItem
            proxyId={proxyId}
            client={client}
            baseUrl={baseUrl}
            installed={installed}
            onSuccess={onSuccess}
          />
          <ProxyUninstallMenuItem
            proxyId={proxyId}
            client={client}
            installed={installed}
            onSuccess={onSuccess}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ProxyMenuItemProps extends ProxyInstallerDropdownProps {
  onSuccess: () => void;
}

function ProxyInstallMenuItem({
  proxyId,
  client,
  baseUrl,
  installed,
  onSuccess,
}: ProxyMenuItemProps) {
  const utils = trpc.useUtils();
  const mutation = trpc.installer.byProxy.install.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy installed",
        description: `This proxy was successfully installed in ${client}.`,
      });
      onSuccess();
    },
  });

  if (installed) {
    return null;
  }

  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        mutation.mutate({ proxyId, client, baseUrl });
      }}
    >
      <MenuItemIcon>
        {mutation.isPending ? (
          <CircleNotchIcon weight="bold" className="animate-spin" />
        ) : (
          <BoxArrowDownIcon />
        )}
      </MenuItemIcon>
      <MenuItemLabel>Install</MenuItemLabel>
    </DropdownMenuItem>
  );
}

function ProxyUninstallMenuItem({
  proxyId,
  client,
  installed,
  onSuccess,
}: Omit<ProxyMenuItemProps, "baseUrl">) {
  const utils = trpc.useUtils();
  const mutation = trpc.installer.byProxy.uninstall.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy uninstalled",
        description: `This proxy was successfully uninstalled from ${client}.`,
      });
      onSuccess();
    },
  });

  if (!installed) {
    return null;
  }

  return (
    <DropdownMenuItem onSelect={() => mutation.mutate({ proxyId, client })}>
      <MenuItemIcon>
        {mutation.isPending ? (
          <CircleNotchIcon weight="bold" className="animate-spin" />
        ) : (
          <TrashIcon weight="fill" />
        )}
      </MenuItemIcon>
      <MenuItemLabel>Uninstall</MenuItemLabel>
    </DropdownMenuItem>
  );
}

{
  /* <Dialog
  open={showManualInstruction}
  onOpenChange={setShowManualInstruction}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Connect manually</DialogTitle>
      <DialogDescription>
        Director works with any MCP enabled product. Below you'll find
        endpoints for both Streamable HTTP and SSE, as well as STDIO via
        our CLI.
      </DialogDescription>
    </DialogHeader>

    <div className="border-t-[0.5px] p-5">
      <ManualInput id={proxyId} />
    </div>
  </DialogContent>
</Dialog> */
}

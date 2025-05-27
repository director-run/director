"use client";

import { useState } from "react";

import { MenuItemLabel } from "@/app/design/components/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useProxy } from "@/hooks/use-proxy";
import { trpc } from "@/trpc/client";
import { CopyIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "../ui/input";
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
  const [copiedText, copy] = useCopyToClipboard();
  const [showManualInstruction, setShowManualInstruction] = useState(false);
  const { proxy, installers } = useProxy(proxyId);

  const KEYS = Object.keys(installers);

  const INSTALLED = KEYS.filter(
    (key) => installers[key as keyof typeof installers],
  );
  const NOT_INSTALLED = KEYS.filter(
    (key) => !installers[key as keyof typeof installers],
  );

  return (
    <div className="flex flex-row gap-x-2">
      {INSTALLED.includes("claude") && <ClaudeBadgeButton proxyId={proxyId} />}
      {INSTALLED.includes("cursor") && <CursorBadgeButton proxyId={proxyId} />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={INSTALLED.length > 0 ? "icon" : "default"}>
            {INSTALLED.length > 0 ? <PlusIcon /> : "Connect"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {NOT_INSTALLED.length > 0 && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel>One-click</DropdownMenuLabel>
                {NOT_INSTALLED.includes("claude") && (
                  <ClaudeMenuItem proxyId={proxyId} />
                )}
                {NOT_INSTALLED.includes("cursor") && (
                  <CursorMenuItem proxyId={proxyId} />
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowManualInstruction(true)}>
              <MenuItemLabel>Connect manually</MenuItemLabel>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
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
      </Dialog>
    </div>
  );
}

function CursorMenuItem({ proxyId }: ProxyInstallersProps) {
  const utils = trpc.useUtils();
  const onSuccessHandler = () => {
    utils.installer.cursor.list.invalidate();
    toast({
      title: "Proxy installed",
      description: "This proxy was successfully installed in Cursor.",
    });
  };
  const installMutation = trpc.installer.cursor.install.useMutation({
    onSuccess: onSuccessHandler,
  });

  return (
    <DropdownMenuItem
      onSelect={() =>
        installMutation.mutate({ proxyId, baseUrl: "http://localhost:3673" })
      }
    >
      <MenuItemLabel>Cursor</MenuItemLabel>
    </DropdownMenuItem>
  );
}

function ClaudeMenuItem({ proxyId }: ProxyInstallersProps) {
  const utils = trpc.useUtils();
  const onSuccessHandler = () => {
    utils.installer.claude.list.invalidate();
    toast({
      title: "Proxy installed",
      description: "This proxy was successfully installed in Claude.",
    });
  };
  const installMutation = trpc.installer.claude.install.useMutation({
    onSuccess: onSuccessHandler,
  });

  return (
    <DropdownMenuItem
      onSelect={() =>
        installMutation.mutate({
          proxyId,
          baseUrl: "http://localhost:3673", // TODO: This is the gateway URL (get it from wherever it's stored...)
        })
      }
    >
      <MenuItemLabel>Claude</MenuItemLabel>
    </DropdownMenuItem>
  );
}

function CursorBadgeButton({ proxyId }: ProxyInstallersProps) {
  const utils = trpc.useUtils();
  const onSuccessHandler = () => {
    utils.installer.cursor.list.invalidate();
    toast({
      title: "Proxy uninstalled",
      description: "This proxy was successfully uninstalled from Cursor.",
    });
  };
  const uninstallMutation = trpc.installer.cursor.uninstall.useMutation({
    onSuccess: onSuccessHandler,
  });

  return (
    <Badge className="h-8 gap-x-2 rounded-lg pr-1">
      <span>Cursor</span>
      <Button
        className="size-6 rounded-md"
        size="icon"
        variant="inverse"
        onClick={() => uninstallMutation.mutate({ proxyId })}
      >
        <XIcon />
        <span className="sr-only">Uninstall</span>
      </Button>
    </Badge>
  );
}

function ClaudeBadgeButton({ proxyId }: ProxyInstallersProps) {
  const utils = trpc.useUtils();
  const onSuccessHandler = () => {
    utils.installer.claude.list.invalidate();
    toast({
      title: "Proxy uninstalled",
      description: "This proxy was successfully uninstalled from Claude.",
    });
  };
  const uninstallMutation = trpc.installer.claude.uninstall.useMutation({
    onSuccess: onSuccessHandler,
  });

  return (
    <Badge className="h-8 gap-x-2 rounded-lg pr-1">
      <span>Claude</span>
      <Button
        className="size-6 rounded-md"
        size="icon"
        variant="inverse"
        onClick={() => uninstallMutation.mutate({ proxyId })}
      >
        <XIcon />
        <span className="sr-only">Uninstall</span>
      </Button>
    </Badge>
  );
}

"use client";

import { CopyIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";

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
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useProxy } from "@/hooks/use-proxy";
import { getDeterministicColor } from "@/lib/deterministic-colors";
import { trpc } from "@/trpc/client";

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

  const endpoint = `http://localhost:3673${proxy?.path}`;

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
              Connect manually
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
              this proxy's endpoint to use via HTTP or SSE.
            </DialogDescription>
          </DialogHeader>

          <div className="flex w-full flex-row items-center gap-x-2 rounded-xl bg-element py-1 pr-1 pl-3">
            <span className="block truncate font-mono text-sm">{endpoint}</span>
            <Button
              className="ml-auto"
              size="icon"
              variant="secondary"
              onClick={async () => {
                await copy(endpoint);
              }}
            >
              <CopyIcon />
              <span className="sr-only">Copy to clipboard</span>
            </Button>
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
      Cursor
    </DropdownMenuItem>
  );
}

function ClaudeMenuItem({ proxyId }: ProxyInstallersProps) {
  const utils = trpc.useUtils();
  const onSuccessHandler = () => {
    utils.installer.claude.list.invalidate();
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
      Claude
    </DropdownMenuItem>
  );
}

function CursorBadgeButton({ proxyId }: ProxyInstallersProps) {
  const utils = trpc.useUtils();
  const onSuccessHandler = () => {
    utils.installer.cursor.list.invalidate();
  };
  const uninstallMutation = trpc.installer.cursor.uninstall.useMutation({
    onSuccess: onSuccessHandler,
  });

  return (
    <Badge
      className="h-8 gap-x-2 rounded-lg pr-1"
      variant={getDeterministicColor("cursor")}
    >
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
  };
  const uninstallMutation = trpc.installer.claude.uninstall.useMutation({
    onSuccess: onSuccessHandler,
  });

  return (
    <Badge
      className="h-8 gap-x-2 rounded-lg pr-1"
      variant={getDeterministicColor("claude")}
    >
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

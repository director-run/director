"use client";

import { trpc } from "@/trpc/client";
import { useState } from "react";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { InstallerCard } from "./installer-card";

interface CursorInstallerProps {
  proxyId: string;
  installed: boolean;
}

export function CursorInstaller({ proxyId, installed }: CursorInstallerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = trpc.useUtils();
  const onSuccessHandler = () => {
    utils.installer.cursor.list.invalidate();
    setIsOpen(false);
  };

  const uninstallMutation = trpc.installer.cursor.uninstall.useMutation({
    onSuccess: onSuccessHandler,
  });
  const installMutation = trpc.installer.cursor.install.useMutation({
    onSuccess: onSuccessHandler,
  });

  const isInstalling = installMutation.isPending;
  const isUninstalling = uninstallMutation.isPending;

  return (
    <ConfirmDialog
      title="Are you sure?"
      description="This action cannot be undone."
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={() => {
        if (installed) {
          uninstallMutation.mutate({ proxyId });
        } else {
          installMutation.mutate({ proxyId, baseUrl: "http://localhost:3673" });
        }
      }}
    >
      <InstallerCard
        title="Cursor"
        description="Use your proxy with Cursor"
        disabled={isInstalling || isUninstalling}
        installed={installed}
      />
    </ConfirmDialog>
  );
}

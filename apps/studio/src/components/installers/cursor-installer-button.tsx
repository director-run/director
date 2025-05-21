"use client";

import { trpc } from "@/trpc/client";
import { Button } from "../ui/button";

interface CursorButtonProps {
  proxyId: string;
}

function CursorInstallButton({ proxyId }: CursorButtonProps) {
  const utils = trpc.useUtils();
  const installMutation = trpc.installer.cursor.install.useMutation({
    onSuccess: () => {
      utils.installer.cursor.list.invalidate();
    },
  });

  return (
    <Button
      onClick={() => {
        installMutation.mutate({
          proxyId,
          baseUrl: "http://localhost:3673",
        });
      }}
    >
      Add to Cursor
    </Button>
  );
}

function CursorUninstallButton({ proxyId }: CursorButtonProps) {
  const utils = trpc.useUtils();
  const uninstallMutation = trpc.installer.cursor.uninstall.useMutation({
    onSuccess: () => {
      utils.installer.cursor.list.invalidate();
    },
  });

  return (
    <Button
      onClick={() => {
        uninstallMutation.mutate({
          proxyId,
        });
      }}
    >
      Remove from Cursor
    </Button>
  );
}

export function CursorButton({ proxyId }: CursorButtonProps) {
  const { data, isLoading } = trpc.installer.cursor.list.useQuery();

  if (isLoading) {
    return <Button disabled>Install</Button>;
  }

  const isInstalled = data?.find(
    (server) => server.name === `director__${proxyId}`,
  );

  if (isInstalled) {
    return <CursorUninstallButton proxyId={proxyId} />;
  }

  return <CursorInstallButton proxyId={proxyId} />;
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { useIsClient } from "@/hooks/use-is-client";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";

export function ConnectionStatusDialog() {
  const isClient = useIsClient();

  const [isHealthy, setIsHealthy] = useState(false);

  const utils = trpc.useUtils();
  const { data, isRefetchError, isFetchedAfterMount } = trpc.health.useQuery(
    undefined,
    {
      refetchInterval: 1_000,
      retry: false,
      retryDelay: 1_000,
      throwOnError: false,
      enabled: isClient,
    },
  );

  useEffect(() => {
    if (data) {
      setIsHealthy(true);
    }
  }, [data]);

  useEffect(() => {
    if (isHealthy) {
      utils.store.getAll.invalidate();
      utils.store.get.invalidate();
    }
  }, [isHealthy]);

  return (
    <Dialog
      open={(data === undefined && isFetchedAfterMount) || isRefetchError}
    >
      <DialogContent dismissable={false}>
        <DialogHeader>
          <Logo className="mb-3" />
          <DialogTitle>Director is connecting…</DialogTitle>
          <DialogDescription>This may take a few seconds.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

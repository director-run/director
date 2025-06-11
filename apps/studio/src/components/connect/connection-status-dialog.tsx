"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { useConnectionStatus } from "./connection-status-provider";

export function ConnectionStatusDialog() {
  const { showDialog } = useConnectionStatus();

  return (
    <Dialog open={showDialog}>
      <DialogContent dismissable={false}>
        <DialogHeader>
          <Logo className="mb-3" />
          <DialogTitle>Director has lost connection</DialogTitle>
          <DialogDescription>
            Please check that the service is running.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

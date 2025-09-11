import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReactNode } from "react";

interface ProxyDeleteConfirmationProps {
  children: ReactNode;
  onConfirm: () => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProxyDeleteConfirmation({
  children,
  onConfirm,
  open,
  onOpenChange,
}: ProxyDeleteConfirmationProps) {
  return (
    <ConfirmDialog
      title="Delete proxy server"
      description="Are you sure you want to delete this proxy server? This action cannot be undone."
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    >
      {children}
    </ConfirmDialog>
  );
}

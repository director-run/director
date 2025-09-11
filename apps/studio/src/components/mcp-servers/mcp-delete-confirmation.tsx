import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReactNode } from "react";

interface McpDeleteConfirmationProps {
  children: ReactNode;
  onConfirm: () => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function McpDeleteConfirmation({
  children,
  onConfirm,
  open,
  onOpenChange,
}: McpDeleteConfirmationProps) {
  return (
    <ConfirmDialog
      title="Delete this server"
      description="Are you sure you want to delete this server? This action cannot be undone."
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    >
      {children}
    </ConfirmDialog>
  );
}

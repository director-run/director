import { ConfirmDialog } from "../ui/confirm-dialog";

interface ProxyDeleteConfirmationProps {
  onConfirm: () => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProxyDeleteConfirmation({
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
    />
  );
}

"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

interface ProxyDeleteConfirmationProps {
  proxyId: string;
  children: ReactNode;
}

export function ProxyDeleteConfirmation({
  proxyId,
  children,
}: ProxyDeleteConfirmationProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const utils = trpc.useUtils();

  const mutation = trpc.store.delete.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      setIsOpen(false);
      router.push("/");
    },
  });

  return (
    <ConfirmDialog
      title="Are you sure?"
      description="This action cannot be undone."
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={() => mutation.mutateAsync({ proxyId })}
    >
      {children}
    </ConfirmDialog>
  );
}

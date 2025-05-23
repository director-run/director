"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface McpDeleteConfirmationProps {
  proxyId: string;
  serverId: string;
}

export function McpDeleteConfirmation({
  proxyId,
  serverId,
}: McpDeleteConfirmationProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const utils = trpc.useUtils();

  const mutation = trpc.store.removeServer.useMutation({
    onSuccess: async () => {
      await utils.store.get.invalidate({ proxyId });
      toast({
        title: "Server deleted",
        description: "This server was successfully deleted.",
      });
      router.push(`/proxies/${proxyId}`);
    },
  });

  return (
    <ConfirmDialog
      title="Delete this server"
      description="Are you sure you want to delete this server? This action cannot be undone."
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={() => mutation.mutateAsync({ proxyId, serverName: serverId })}
    >
      <Button size="icon" className="self-start">
        <Trash2Icon />
        <span className="sr-only">Delete server</span>
      </Button>
    </ConfirmDialog>
  );
}

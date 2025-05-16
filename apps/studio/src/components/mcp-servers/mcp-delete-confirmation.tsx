"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { Loader } from "../ui/loader";

interface McpDeleteConfirmationProps {
  proxyId: string;
  serverId: string;
  children?: ReactNode;
}

export function McpDeleteConfirmation({
  children,
  proxyId,
  serverId,
}: McpDeleteConfirmationProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const utils = trpc.useUtils();

  const mutation = trpc.store.removeServer.useMutation({
    onSuccess: async () => {
      await utils.store.get.invalidate({ proxyId });
      router.push(`/proxies/${proxyId}`);
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children ?? <Button className="self-start">Delete server</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="text-foreground-inverse"
            disabled={mutation.isPending}
          >
            Cancel
          </AlertDialogCancel>

          <Button
            type="button"
            variant="inverse"
            onClick={async (event) => {
              event.preventDefault();
              await mutation.mutateAsync({ proxyId, serverName: serverId });
            }}
          >
            {mutation.isPending ? (
              <Loader className="text-foreground-subtle" />
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

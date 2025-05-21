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

interface ProxyDeleteConfirmationProps {
  proxyId: string;
  children?: ReactNode;
}

export function ProxyDeleteConfirmation({
  children,
  proxyId,
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
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {children ?? <Button className="self-start">Delete proxy</Button>}
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
              await mutation.mutateAsync({ proxyId });
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

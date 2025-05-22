"use client";

import { useZodForm } from "@/hooks/use-zod-form";
import { ReactNode, useEffect } from "react";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";
import { Form } from "./form";

interface ConfirmDialogProps {
  title: string;
  description: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  children?: ReactNode;
}

export function ConfirmDialog({
  children,
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const form = useZodForm({
    schema: z.object({}),
    defaultValues: {},
  });

  useEffect(() => {
    if (!open && form.formState.isSubmitSuccessful) {
      form.reset();
    }
  }, [open, form.formState.isSubmitSuccessful]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Form form={form} onSubmit={onConfirm} className="w-fit">
            <Button type="submit">Confirm</Button>
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

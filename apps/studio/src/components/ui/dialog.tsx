"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/cn";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "./button";
import { textVariants } from "./typography";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay className={cn("overlay", className)} {...props} />
  );
}

interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  dismissable?: boolean;
}

function DialogContent({
  className,
  children,
  dismissable = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "popover rounded-xl",
          "fixed inset-x-1 top-1 z-50 grid outline-none duration-200",
          "sm:top-12 sm:left-[50%] sm:w-full sm:max-w-md sm:translate-x-[-50%]",
          "radix-state-[open]:fade-in-0 radix-state-[open]:zoom-in-95 radix-state-[open]:slide-in-from-top-[48%] radix-state-[open]:animate-in",
          "radix-state-[closed]:fade-out-0 radix-state-[closed]:zoom-out-95 radix-state-[closed]:slide-out-to-top-[48%] radix-state-[closed]:animate-out",
          className,
        )}
        {...props}
      >
        {children}
        {dismissable && (
          <DialogPrimitive.Close
            className={cn("absolute top-1 right-1 rounded-lg")}
            asChild
          >
            <Button variant="secondary" size="icon">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-y-1 p-5 text-start", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(textVariants({ variant: "h2" }), "text-fg", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn(
        textVariants({ variant: "p" }),
        "text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

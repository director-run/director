"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/cn";
import { Button } from "./button";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "radix-state-[closed]:fade-out-0 radix-state-[open]:fade-in-0 fixed inset-0 z-50 radix-state-[closed]:animate-out radix-state-[open]:animate-in bg-foreground/90 backdrop-blur-sm",
        "dark:bg-background/50",
        className,
      )}
      {...props}
    />
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
          "fixed top-[25%] left-[50%] z-50 grid w-full max-w-[90%] translate-x-[-50%] gap-4 rounded-2xl bg-background p-6 text-foreground outline-none duration-200 sm:max-w-lg",
          "radix-state-[closed]:fade-out-0 radix-state-[open]:fade-in-0 radix-state-[closed]:zoom-out-95 radix-state-[open]:zoom-in-95 radix-state-[closed]:slide-out-to-top-[48%] radix-state-[open]:slide-in-from-top-[48%] radix-state-[closed]:animate-out radix-state-[open]:animate-in",
          "dark:bg-element",
          className,
        )}
        {...props}
      >
        {children}
        {dismissable && (
          <DialogPrimitive.Close
            className={cn("absolute top-1 right-1")}
            asChild
          >
            <Button variant="inverse" size="icon">
              <X className="h-4 w-4" />
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
      className={cn("flex flex-col gap-y-2 text-start", className)}
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
      className={cn(
        "font-normal text-foreground text-xl leading-none tracking-tight",
        className,
      )}
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
      className={cn("text-base text-foreground-subtle", className)}
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

"use client";

import {
  DialogDescription,
  type DialogProps,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { EmptyState } from "./empty-state";

export function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CommandDialog({ children, ...props }: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0" dismissable={false}>
        <VisuallyHidden>
          <DialogTitle>Add tool</DialogTitle>
          <DialogDescription>
            Search for mcp servers and add them to your proxy
          </DialogDescription>
        </VisuallyHidden>
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      className="flex items-center border-b-[0.5px] px-3"
      cmdk-input-wrapper=""
    >
      <MagnifyingGlassIcon
        weight="bold"
        className="mr-2 size-4 shrink-0 opacity-50"
      />
      <CommandPrimitive.Input
        className={cn(
          "flex h-10 w-full bg-transparent text-sm outline-none placeholder:text-foreground-subtle/80 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn(
        "max-h-[300px] overflow-y-auto overflow-x-hidden p-1",
        className,
      )}
      {...props}
    />
  );
}

export function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <EmptyState className="rounded-lg" asChild>
      <CommandPrimitive.Empty {...props} />
    </EmptyState>
  );
}

export function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn("overflow-hidden text-fg", className)}
      {...props}
    />
  );
}

export function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "data-[selected=true]:bg-accent-subtle",
        className,
      )}
      {...props}
    />
  );
}

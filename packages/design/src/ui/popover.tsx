"use client";

import { cn } from "@director.run/design/lib/cn";
import { Popover as PopoverPrimitive } from "radix-ui";
import type * as React from "react";

export function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        avoidCollisions={true}
        className={cn(
          "z-50 w-[800px] min-w-0 max-w-[calc(100dvw-1rem)] origin-(--radix-popover-content-transform-origin) rounded-lg bg-surface-subtle p-4 text-content-primary shadow-popover outline-hidden sm:max-w-80 dark:bg-surface-neutral",
          "radix-state-[closed]:fade-out-0 radix-state-[open]:fade-in-0 radix-state-[closed]:zoom-out-95 radix-state-[open]:zoom-in-95 radix-state-[closed]:animate-out radix-state-[open]:animate-in",
          "radix-side-[bottom]:slide-in-from-top-2 radix-side-[left]:slide-in-from-right-2 radix-side-[right]:slide-in-from-left-2 radix-side-[top]:slide-in-from-bottom-2",
          className,
        )}
        collisionPadding={8}
        data-slot="popover-content"
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

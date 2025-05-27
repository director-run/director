"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type * as React from "react";

import { cn } from "@/lib/cn";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) => {
  return (
    <DropdownMenuPrimitive.Group
      className={cn("flex flex-col gap-y-px p-1", className)}
      {...props}
    />
  );
};

const DropdownMenuContent = ({
  className,
  side = "bottom",
  sideOffset = 2,
  align = "start",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      side={side}
      align={align}
      className={cn(
        "popover",
        "max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-48 max-w-72",
        "radix-state-[closed]:fade-out-0 radix-state-[open]:fade-in-0 radix-state-[closed]:zoom-out-95 radix-state-[open]:zoom-in-95 radix-state-[closed]:animate-out radix-state-[open]:animate-in",
        "radix-side-[bottom]:slide-in-from-top-2 radix-side-[left]:slide-in-from-right-2 radix-side-[right]:slide-in-from-left-2 radix-side-[top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
}) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "relative flex h-7 w-full min-w-0 flex-row items-center gap-x-0.5 rounded-md bg-transparent px-1 text-fg-subtle",
      "font-medium text-[13px] leading-7 tracking-[0.01em]",
      "cursor-default select-none outline-none transition-colors duration-200 ease-in-out",
      "radix-[highlighted]:bg-accent-subtle radix-[highlighted]:text-fg",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
);

const DropdownMenuLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      "flex h-5 w-full min-w-0 select-none items-center px-2 font-medium font-mono text-[11px] text-fg-subtle/80 uppercase tracking-[0.05em]",
      className,
    )}
    {...props}
  />
);

const DropdownMenuSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator
    className={cn("-mx-1 h-[0.5px] bg-accent", className)}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
};

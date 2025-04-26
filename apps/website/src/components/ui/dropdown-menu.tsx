"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, Circle } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/cn";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

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
        "popover overflow-y-auto overflow-x-hidden font-mono text-xs uppercase leading-none tracking-wide",
        "max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-48 max-w-[var(--radix-dropdown-menu-trigger-width)]",
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
      "group relative flex h-7 cursor-default select-none items-center gap-2 px-2 outline-none transition-colors",
      "focus:bg-background/25 focus:text-foreground-inverse data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
);

const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => (
  <DropdownMenuPrimitive.CheckboxItem
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 outline-none transition-colors focus:bg-element focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
);

const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) => (
  <DropdownMenuPrimitive.RadioItem
    className={cn(
      "relative flex h-7 cursor-default select-none items-center pr-2 pl-8 outline-none transition-colors focus:bg-background/25 focus:text-foreground-inverse data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
);

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) => (
  <DropdownMenuPrimitive.Label
    className={cn("px-2 py-1.5 font-semibold", inset && "pl-8", className)}
    {...props}
  />
);

const DropdownMenuSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator
    className={cn("-mx-1 h-0.5 bg-background", className)}
    {...props}
  />
);

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
};

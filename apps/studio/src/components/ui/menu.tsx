"use client";

import { cn } from "@/lib/cn";
import { IconWeight } from "@phosphor-icons/react";
import { Slot } from "@radix-ui/react-slot";

interface PrimitiveBaseProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

export function Menu({
  children,
  className,
  asChild,
  ...props
}: PrimitiveBaseProps) {
  const Component = asChild ? Slot : "div";
  return (
    <Component className={cn("flex flex-col gap-y-px", className)} {...props}>
      {children}
    </Component>
  );
}

export function MenuItem({
  children,
  className,
  asChild,
  ...props
}: PrimitiveBaseProps) {
  const Component = asChild ? Slot : "div";
  return (
    <Component
      className={cn(
        "flex h-7 w-full min-w-0 flex-row items-center gap-x-0.5 rounded-md bg-transparent px-1 text-fg-subtle",
        "cursor-pointer font-medium text-[13px] leading-7 tracking-[0.01em]",
        "cursor-default select-none outline-none transition-colors duration-200 ease-in-out hover:bg-accent",
        "radix-[highlighted]:bg-accent radix-[highlighted]:text-fg",
        "data-[state=active]:bg-accent data-[state=active]:text-fg",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function MenuItemLabel({
  children,
  className,
  asChild,
  ...props
}: PrimitiveBaseProps) {
  const Component = asChild ? Slot : "span";
  return (
    <Component
      className={cn(
        "block grow truncate px-1",
        "font-medium text-[13px] leading-7 tracking-[0.01em]",
        "last:pr-4",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface MenuItemIconProps {
  className?: string;
  children: React.ReactNode;
  color?: string;
  weight?: IconWeight;
}

export function MenuItemIcon({
  children,
  className,
  weight = "fill",
  color = "currentcolor",
}: MenuItemIconProps) {
  return (
    <Slot
      className={cn("size-5 shrink-0", className)}
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      {...({ weight, color } as any)}
    >
      {children}
    </Slot>
  );
}

interface MenuLabelProps extends PrimitiveBaseProps {
  label: string;
}

export function MenuLabel({
  label,
  children,
  className,
  ...props
}: MenuLabelProps) {
  return (
    <MenuItem
      className={cn("gap-x-0.5 hover:bg-transparent", className)}
      {...props}
    >
      <MenuItemLabel className="font-medium font-mono text-[11px] text-fg-subtle uppercase tracking-[0.05em]">
        {label}
      </MenuItemLabel>
      {children}
    </MenuItem>
  );
}

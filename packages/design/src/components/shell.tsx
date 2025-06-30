import { cn } from "@director.run/design/lib/cn";
import { Button } from "@director.run/design/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@director.run/design/ui/dropdown-menu";
import { ChevronsUpDownIcon, SlashIcon } from "lucide-react";
import { Separator as SeparatorPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

export function Shell({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-svh w-svw flex-col gap-y-2 overflow-hidden p-2",
        className,
      )}
      data-slot="shell"
      {...props}
    />
  );
}

export function ShellHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-row items-center justify-between gap-x-1",
        className,
      )}
      data-slot="shell-header"
      {...props}
    />
  );
}

export function ShellContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex grow flex-col overflow-hidden rounded-md bg-surface shadow-hairline",
        className,
      )}
      data-slot="shell-content"
      {...props}
    />
  );
}

export function ShellBreadcrumb({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex grow overflow-hidden",
        "after:absolute after:top-0 after:right-0 after:bottom-px after:w-8 after:bg-gradient-to-l after:from-background after:to-transparent",
        className,
      )}
      data-slot="shell-breadcrumb"
      {...props}
    >
      {children}
    </div>
  );
}

export function ShellBreadcrumbList({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "no-scrollbar flex flex-row items-center overflow-x-scroll py-1 pr-8 pl-1",
        className,
      )}
      data-slot="shell-breadcrumb-list"
      {...props}
    >
      {children}
    </div>
  );
}

export function ShellBreadcrumbSeparator({
  className,
  ...props
}: ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      className={cn(
        "[&>svg]:-rotate-15 shrink-0 px-1.5 text-content-tertiary/75 [&>svg]:size-3",
        className,
      )}
      data-slot="shell-breadcrumb-separator"
      {...props}
    >
      <SlashIcon />
    </SeparatorPrimitive.Root>
  );
}

export function ShellBreadcrumbAction({
  className,
  variant = "tertiary",
  size = "sm",
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "max-w-[8rem] text-content-primary [&>span]:truncate",
        className,
      )}
      size={size}
      variant={variant}
      {...props}
    />
  );
}

interface ShellBreadcrumbDropdownProps
  extends ComponentProps<typeof DropdownMenuContent> {
  label: string;
}

export function ShellBreadcrumbDropdown({
  label,
  className,
  side = "bottom",
  align = "start",
  children,
  ...props
}: ShellBreadcrumbDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="!w-auto !px-1" size="sm" variant="tertiary">
          <ChevronsUpDownIcon />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn("min-w-48", className)}
        side={side}
        {...props}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

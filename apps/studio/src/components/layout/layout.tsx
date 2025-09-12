"use client";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../helpers/cn";
import { Sheet } from "../ui/sheet";
import { SidebarContent } from "./navigation";

interface SidebarSheetProps extends ComponentProps<typeof Sheet> {
  children?: ReactNode;
}

interface Server {
  id: string;
  name: string;
}

interface LayoutRootProps extends ComponentProps<"div"> {
  servers?: Server[];
  isLoading?: boolean;
  error?: string | null;
}

export function LayoutRoot({
  className,
  children,
  servers,
  isLoading,
  error,
  ...props
}: LayoutRootProps) {
  return (
    <div
      data-slot="layout"
      className={cn(
        "flex h-screen w-screen flex-row overflow-hidden bg-bg text-fg",
        className,
      )}
      {...props}
    >
      <div
        data-slot="layout-sidebar"
        className={cn(
          "hidden w-full max-w-[220px] shrink-0 overflow-y-auto overflow-x-hidden md:flex",
        )}
      >
        <SidebarContent servers={servers} isLoading={isLoading} error={error} />
      </div>
      <div
        data-slot="layout-content"
        className="flex grow flex-col overflow-hidden p-2 md:pl-px"
      >
        {children}
      </div>
    </div>
  );
}

export function LayoutView({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "@container/page overflow-hidden text-fg",
        "flex grow flex-col rounded-md bg-surface shadow-[0_0_0_0.5px_rgba(55,50,46,0.2)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LayoutViewContent({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex grow flex-col overflow-y-auto overflow-x-hidden py-8 md:py-12 lg:py-16",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

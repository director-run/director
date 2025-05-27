"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { SidebarIcon } from "@phosphor-icons/react";
import { ComponentProps } from "react";
import { SidebarSheet } from "./sidebar";

export function Page({ className, children, ...props }: ComponentProps<"div">) {
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

export function PageHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-row items-center gap-x-2",
        "h-13 border-accent border-b-[0.5px] bg-surface px-4 md:px-8 lg:px-12",
        className,
      )}
      {...props}
    >
      <SidebarSheet>
        <Button size="icon" variant="ghost">
          <SidebarIcon weight="fill" className="!size-5 shrink-0" />
          <span className="sr-only">Open sidebar</span>
        </Button>
      </SidebarSheet>
      {children}
    </div>
  );
}

export function PageContent({
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

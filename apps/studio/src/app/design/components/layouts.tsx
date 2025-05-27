import { cn } from "@/lib/cn";
import { ComponentProps } from "react";
import { SidebarContent } from "./sidebar";

export function Layout({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
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
        <SidebarContent />
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

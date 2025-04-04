"use client";

import { cn } from "@/lib/cn";

export function GlobalLayout({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-device w-full flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}

"use client";

import { cn } from "@/lib/cn";
import React from "react";

export function GlobalLayout({
  children,
  className,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("flex min-h-svh w-full flex-col", className)}
      {...props}
    >
      {children}
    </main>
  );
}

export function GlobalLayoutHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex flex-row items-center justify-between",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

export function GlobalLayoutContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex grow flex-col", className)} {...props}>
      {children}
    </div>
  );
}

"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/cn";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn("flex w-full flex-col gap-y-1 text-start", className)}
      {...props}
    />
  );
}
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex h-7 w-full items-center gap-x-1", className)}
      {...props}
    />
  );
}
TabsList.displayName = TabsPrimitive.List.displayName;

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap transition-colors duration-200 ease-in-out",
        "h-7 cursor-pointer px-2.5 font-mono text-sm",
        "radix-state-[active]:bg-primary radix-state-[active]:text-foreground-inverse",
        "radix-state-[inactive]:bg-element radix-state-[inactive]:text-foreground-subtle radix-state-[inactive]:hover:bg-element-hover radix-state-[inactive]:hover:text-foreground",
        "disabled:cursor-not-allowed disabled:bg-element disabled:text-foreground-faint dark:disabled:text-foreground-faint",
        className,
      )}
      {...props}
    />
  );
}
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("w-full bg-element outline-none", className)}
      {...props}
    />
  );
}
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

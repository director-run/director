import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/cn";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
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
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-fit items-center justify-center gap-x-0.5",
        "rounded-sm bg-gray-12 p-0.5",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-xs transition-all",
        "h-6 px-2.5 font-mono font-normal text-xs uppercase leading-none tracking-widest",
        "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        "data-[state=active]:bg-gray-1 data-[state=active]:text-gray-12",
        "data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-9 data-[state=inactive]:hover:bg-gray-11 data-[state=inactive]:hover:text-gray-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

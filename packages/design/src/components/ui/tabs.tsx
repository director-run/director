"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "../../helpers/cn";

interface TabProps {
  id: string;
  label?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  default: string;
  className?: string;
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
}

function Tab(_props: TabProps) {
  // This component is just a declarative container, it doesn't render
  return null;
}

function Tabs({ default: defaultValue, className, children }: TabsProps) {
  // Extract tab configurations from children
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> =>
      React.isValidElement(child) && child.type === Tab,
  );

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      defaultValue={defaultValue}
    >
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "inline-flex w-fit items-center justify-center gap-x-0.5 rounded-lg border-[0.5px] border-fg/15 bg-accent-subtle p-1 text-fg-subtle",
        )}
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.props.id}
            value={tab.props.id}
            data-slot="tabs-trigger"
            className={cn(
              "inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1 font-[450] text-fg text-sm transition-[color,box-shadow]",
              "radix-state-[active]:bg-surface radix-state-[active]:shadow-[0_3px_9px_0px_rgba(55,50,46,0.07),_0_0_0_0.5px_rgba(55,50,46,0.15)]",
              "radix-state-[inactive]:hover:bg-surface/50 radix-state-[inactive]:hover:shadow-[0_0_0_0.5px_rgba(55,50,46,0.15)]",
              "disabled:pointer-events-none disabled:opacity-50 has-[svg:first-child]:pl-2.5",
              "[&_svg:not([class*='size-'])]:size-4.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
            )}
          >
            {tab.props.icon}
            {tab.props.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>

      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.props.id}
          value={tab.props.id}
          data-slot="tabs-content"
          className={cn(
            "flex-1 outline-none",
            "rounded-xl border-[0.5px] bg-accent-subtle/20 p-6",
          )}
        >
          {tab.props.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}

export { Tabs, Tab };

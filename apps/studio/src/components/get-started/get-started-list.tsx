"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ComponentProps } from "react";

import { cn } from "@/lib/cn";
import {
  CheckCircleIcon,
  CircleIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";

export function GetStartedList({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="get-started-list"
      className={cn("flex flex-col gap-y-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface GetStartedListItemProps
  extends ComponentProps<typeof CollapsiblePrimitive.Root> {
  title: string;
  status: "completed" | "in-progress" | "not-started";
}

export function GetStartedListItem({
  className,
  children,
  title,
  status = "not-started",
  ...props
}: GetStartedListItemProps) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="get-started-list-item"
      className={cn(
        "rounded-2xl",
        props.disabled ? "bg-accent" : "popover",
        className,
      )}
      {...props}
    >
      <CollapsiblePrimitive.Trigger
        data-slot="get-started-list-item-trigger"
        tabIndex={-1}
        className="group flex w-full flex-row items-center justify-between gap-x-2 py-3.5 pr-3.5 pl-3.5 text-start outline-none disabled:cursor-default"
      >
        {(() => {
          switch (status) {
            case "completed":
              return (
                <CheckCircleIcon
                  weight="fill"
                  className="size-6 text-success-fg"
                />
              );
            case "in-progress":
              return (
                <CircleNotchIcon weight="fill" className="size-6 text-fg/75" />
              );
            case "not-started":
              return <CircleIcon weight="fill" className="size-6 text-fg/30" />;
          }
        })()}
        <span className="flex-1 font-[450] text-[15px] leading-6 tracking-[0.01em]">
          {title}
        </span>
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content
        data-slot="get-started-list-item-content"
        className="border-t-[0.5px]"
      >
        {children}
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}

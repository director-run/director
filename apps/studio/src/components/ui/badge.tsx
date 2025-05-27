"use client";

import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";
import { IconWeight } from "@phosphor-icons/react";
import { Slot } from "@radix-ui/react-slot";

const badgeVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-x-0 whitespace-nowrap rounded-md",
    "font-medium font-mono tracking-[0.05em]",
  ],
  {
    variants: {
      variant: {
        default: "bg-accent text-fg-subtle",
        success: "bg-success text-success-fg",
        destructive: "bg-destructive text-destructive-fg",
      },
      size: {
        default: "h-6 px-[3px] text-[11px] leading-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, size, asChild, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

interface BadgeLabelProps extends React.ComponentProps<"span"> {
  uppercase?: boolean;
}

function BadgeLabel({
  children,
  className,
  uppercase,
  ...props
}: BadgeLabelProps) {
  return (
    <span
      className={cn("px-1", uppercase && "uppercase", className)}
      {...props}
    >
      {children}
    </span>
  );
}

interface BadgeIconProps {
  className?: string;
  children: React.ReactNode;
  color?: string;
  weight?: IconWeight;
}

function BadgeIcon({
  children,
  className,
  weight = "fill",
  color = "currentcolor",
}: BadgeIconProps) {
  return (
    <Slot
      className={cn("size-5 shrink-0", className)}
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      {...({ weight, color } as any)}
    >
      {children}
    </Slot>
  );
}

function BadgeGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-row flex-wrap gap-1", className)}
      {...props}
    />
  );
}

export { Badge, BadgeLabel, BadgeGroup, BadgeIcon, badgeVariants };

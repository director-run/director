import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@director.run/design/lib/cn";

const badgeVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-x-0 whitespace-nowrap rounded-md",
    "font-bold font-mono tracking-[0.05em]",
    "[a&]:focus-visible",
  ],
  {
    variants: {
      variant: {
        primary: "bg-interactive-primary text-interactive-accent",
        accent: "bg-interactive-accent text-interactive-primary",
        secondary: "bg-interactive-secondary text-content-primary",
        tertiary:
          "bg-transparent text-content-secondary [a&]:hover:bg-interactive-secondary",
        inverse: "bg-base text-base-inverse",
        negative: "bg-sentiment-negative text-base-light",
        positive: "bg-sentiment-positive text-base-light",
        warning: "bg-sentiment-warning text-base-dark",
        green: "bg-forest text-green dark:bg-green dark:text-forest",
        blue: "bg-lagoon text-beira dark:bg-beira dark:text-lagoon",
        orange: "bg-slate text-sunflower dark:bg-sunflower dark:text-slate",
        pink: "bg-wine text-rose dark:bg-rose dark:text-wine",
        lime: "bg-spruce text-lime dark:bg-lime dark:text-spruce",
      },
      size: {
        sm: "h-5 px-0.5 text-[11px] leading-5",
        md: "h-6 px-[3px] text-[11px] leading-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, size, asChild, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "div";
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
}

function BadgeIcon({ children, className }: BadgeIconProps) {
  return (
    <div
      className={cn(
        "flex size-5 items-center justify-center",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        className,
      )}
    >
      <Slot.Root>{children}</Slot.Root>
    </div>
  );
}

function BadgeGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-row flex-wrap gap-x-1.5 gap-y-1", className)}
      {...props}
    />
  );
}

export { Badge, BadgeGroup, BadgeIcon, BadgeLabel, badgeVariants };

"use client";

import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";
import { IconWeight } from "@phosphor-icons/react";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-x-0 rounded-md",
    "cursor-pointer select-none whitespace-nowrap tracking-[0.01em]",
    "transition-colors duration-200 ease-in-out will-change-auto",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg hover:bg-fg hover:text-surface",
        secondary: "bg-accent text-fg/90 hover:bg-fg hover:text-surface",
        ghost: "bg-transparent text-fg/90 hover:bg-accent",
      },
      size: {
        xs: [
          "h-6 px-1 font-[450] text-sm leading-6 tracking-[0.02em]",
          "[&>[data-slot='button-icon']]:size-3.5",
        ],
        sm: [
          "h-7 px-2 font-[450] text-sm leading-7 tracking-[0.02em]",
          "[&>[data-slot='button-icon']]:size-4",
        ],
        lg: [
          "h-10 px-3 font-[450] text-lg leading-10",
          "[&>[data-slot='button-icon']]:size-5",
        ],
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  },
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ButtonVariants {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function ButtonLabel({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="button-label"
      className={cn("px-1.5 [[data-size=lg]>&]:px-2.5", className)}
      {...props}
    >
      {children}
    </span>
  );
}

interface ButtonIconProps {
  className?: string;
  children: React.ReactNode;
  color?: string;
  weight?: IconWeight;
}

function ButtonIcon({
  children,
  className,
  weight = "duotone",
  color = "currentcolor",
}: ButtonIconProps) {
  return (
    <Slot
      data-slot="button-icon"
      className={cn("shrink-0", className)}
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      {...({ weight, color } as any)}
    >
      {children}
    </Slot>
  );
}

function ButtonGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group"
      className={cn("flex flex-row flex-wrap gap-1", className)}
      {...props}
    />
  );
}

export {
  Button,
  ButtonLabel,
  ButtonGroup,
  ButtonIcon,
  buttonVariants,
  type ButtonVariants,
};

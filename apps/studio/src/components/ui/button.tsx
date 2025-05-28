import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap duration-200",
    "select-none font-medium font-sans tracking-[0.01em] outline-none",
    "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "bg-fg text-surface hover:bg-fg/80 active:bg-fg/90",
        secondary: "bg-accent text-fg transition-opacity hover:opacity-50",
        inverse: "bg-surface text-fg hover:bg-surface/50",
        ghost:
          "bg-transparent text-fg-subtle transition-colors hover:bg-accent hover:text-fg focus-visible:bg-accent focus-visible:text-fg",
      },
      size: {
        sm: "h-6 rounded-md px-2.5 pb-0.25 text-[13px]",
        default: "h-7 rounded-md px-2.5 pb-0.25 text-xs",
        lg: "h-10 rounded-lg px-4 pb-0.25 text-base",
        icon: "size-6 rounded-md [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps extends ComponentProps<"button">, ButtonVariants {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap transition-colors duration-200",
    "font-sans text-sm tracking-[0.01em]",
    "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
    "disabled:cursor-not-allowed disabled:bg-element disabled:text-foreground-faint dark:disabled:text-foreground-faint",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-background hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-element text-foreground hover:bg-element-hover active:bg-element-active",
        inverse: "bg-background text-foreground hover:bg-background/50",
        ghost:
          "bg-transparent text-foreground-subtle hover:bg-element-hover hover:text-foreground active:bg-element-active disabled:bg-transparent",
      },
      size: {
        default: "h-8 rounded-lg px-3 pb-0.25",
        lg: "h-10 rounded-lg px-4 pb-0.25 text-base",
        icon: "size-8 rounded-lg [&_svg]:size-4",
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

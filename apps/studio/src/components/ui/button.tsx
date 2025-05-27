import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

{
  /* className="flex size-6 cursor-pointer items-center justify-center rounded-md bg-transparent text-fg-subtle outline-none transition-colors duration-200 ease-in-out " */
}

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-x-2 whitespace-nowrap duration-200",
    "font-sans text-sm tracking-[0.01em] outline-none",
    "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-background hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-accent text-fg-subtle hover:opacity-50 transition-opacity",
        inverse: "bg-background text-foreground hover:bg-background/50",
        ghost:
          "bg-transparent text-fg-subtle hover:bg-accent hover:text-fg focus-visible:bg-accent focus-visible:text-fg transition-colors",
      },
      size: {
        default: "h-8 rounded-lg px-3 pb-0.25",
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

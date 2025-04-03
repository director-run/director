import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { Conditional } from "@/components/conditional";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-xs transition-all",
    "font-mono font-normal text-xs uppercase leading-none tracking-[0.1em]",
    "outline-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-gray-12 text-gray-1 hover:bg-gray-11",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90 focus-visible:ring-red-500",
        outline:
          "border border-gray-6 bg-gray-1 text-gray-11 hover:bg-gray-3 hover:text-gray-12",
        secondary: "bg-gray-6 text-gray-12 hover:bg-gray-7",
        ghost: "hover:bg-gray-4 hover:text-gray-12",
        link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
      },
      size: {
        default: "h-6 px-2.5",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-10 px-6",
        icon: "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltip?: string;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  tooltip,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Conditional
      condition={!!tooltip}
      wrap={(child) => (
        <Tooltip>
          <TooltipTrigger asChild>{child}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )}
    >
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    </Conditional>
  );
}

export { Button, buttonVariants };

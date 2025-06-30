import { cn } from "@director.run/design/lib/cn";
import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

const chipVariants = cva(
  [
    "inline-flex shrink-0 select-none items-center justify-center gap-x-0 whitespace-nowrap rounded-md",
    "[&>svg]:size-5 [&>svg]:stroke-[1.5]",
  ],
  {
    variants: {
      variant: {
        green: "bg-forest text-green dark:bg-green dark:text-forest",
        blue: "bg-lagoon text-beira dark:bg-beira dark:text-lagoon",
        orange: "bg-slate text-sunflower dark:bg-sunflower dark:text-slate",
        pink: "bg-wine text-rose dark:bg-rose dark:text-wine",
        lime: "bg-spruce text-lime dark:bg-lime dark:text-spruce",
      },
      size: {
        xs: "size-6",
        sm: "size-7",
        md: "size-8",
        lg: "size-10",
      },
    },
    defaultVariants: {
      variant: "green",
      size: "md",
    },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  asChild?: boolean;
}

function Chip({ className, variant, size, asChild, ...props }: ChipProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      className={cn(chipVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Chip, chipVariants };

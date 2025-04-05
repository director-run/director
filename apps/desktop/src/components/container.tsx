import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/cn";

const containerVariants = cva(
  [
    "grid w-full auto-rows-min",
    "gap-x-6 gap-y-20",
    "*:col-span-1 *:col-start-2",
  ],
  {
    variants: {
      size: {
        sm: [
          "grid-cols-[1fr_min(30rem,_calc(100%-1.5rem*2))_1fr]",
          "md:grid-cols-[1fr_min(30rem,_calc(100%-2rem*2))_1fr]",
          "lg:grid-cols-[1fr_min(30rem,_calc(100%-2.5rem*2))_1fr]",
        ],
        md: [
          "grid-cols-[1fr_min(40rem,_calc(100%-1.5rem*2))_1fr]",
          "md:grid-cols-[1fr_min(40rem,_calc(100%-2rem*2))_1fr]",
          "lg:grid-cols-[1fr_min(40rem,_calc(100%-2.5rem*2))_1fr]",
        ],
        lg: [
          "grid-cols-[1fr_min(50rem,_calc(100%-1.5rem*2))_1fr]",
          "md:grid-cols-[1fr_min(50rem,_calc(100%-2rem*2))_1fr]",
          "lg:grid-cols-[1fr_min(50rem,_calc(100%-2.5rem*2))_1fr]",
        ],
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type ContainerVariants = VariantProps<typeof containerVariants>;

interface ContainerProps
  extends React.ComponentProps<"div">,
    ContainerVariants {
  asChild?: boolean;
}

export function Container({
  children,
  className,
  asChild,
  size,
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp className={cn(containerVariants({ size }), className)} {...props}>
      {children}
    </Comp>
  );
}

export function FullBleed({
  children,
  className,
  asChild,
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="full-bleed"
      className={cn(
        "data-[slot=full-bleed]:col-span-full data-[slot=full-bleed]:col-start-1",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

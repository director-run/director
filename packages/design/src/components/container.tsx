import { cn } from "@director.run/design/lib/cn";
import { type VariantProps, cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

const containerVariants = cva(
  [
    "grid w-full auto-rows-min",
    "gap-x-6 gap-y-16 md:gap-x-12 lg:gap-x-16",
    "*:col-span-1 *:col-start-2",
  ],
  {
    variants: {
      size: {
        sm: [
          "grid-cols-[1fr_min(30rem,_calc(100%-1.5rem*2))_1fr]",
          "md:grid-cols-[1fr_min(30rem,_calc(100%-3rem*2))_1fr]",
          "lg:grid-cols-[1fr_min(30rem,_calc(100%-4rem*2))_1fr]",
        ],
        md: [
          "grid-cols-[1fr_min(40rem,_calc(100%-1.5rem*2))_1fr]",
          "md:grid-cols-[1fr_min(40rem,_calc(100%-3rem*2))_1fr]",
          "lg:grid-cols-[1fr_min(40rem,_calc(100%-4rem*2))_1fr]",
        ],
        lg: [
          "grid-cols-[1fr_min(50rem,_calc(100%-1.5rem*2))_1fr]",
          "md:grid-cols-[1fr_min(50rem,_calc(100%-3rem*2))_1fr]",
          "lg:grid-cols-[1fr_min(50rem,_calc(100%-4rem*2))_1fr]",
        ],
        xl: [
          "grid-cols-[1fr_min(70rem,_calc(100%-1.5rem*2))_1fr]",
          "md:grid-cols-[1fr_min(70rem,_calc(100%-3rem*2))_1fr]",
          "lg:grid-cols-[1fr_min(70rem,_calc(100%-4rem*2))_1fr]",
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
  const Comp = asChild ? Slot.Root : "div";

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
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      className={cn(
        "data-[slot=full-bleed]:col-span-full data-[slot=full-bleed]:col-start-1",
        className,
      )}
      data-slot="full-bleed"
      {...props}
    >
      {children}
    </Comp>
  );
}

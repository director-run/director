import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import { ComponentProps } from "react";

interface ContainerProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export function Container({
  children,
  className,
  asChild,
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "grid auto-rows-min",
        "grid-cols-[1fr_min(80ch,_calc(100%-1rem*2))_1fr] gap-x-4",
        "sm:grid-cols-[1fr_min(80ch,_calc(100%-1.5rem*2))_1fr] sm:gap-x-6",
        "md:grid-cols-[1fr_min(80ch,_calc(100%-2rem*2))_1fr] md:gap-x-8",
        "lg:grid-cols-[1fr_min(80ch,_calc(100%-2.5rem*2))_1fr] lg:gap-x-10",
        "*:col-span-1 *:col-start-2",
        className,
      )}
      {...props}
    >
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

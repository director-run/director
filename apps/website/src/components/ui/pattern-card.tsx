"use client";

import { Slot } from "@radix-ui/react-slot";

import { Pattern } from "@/components/ui/pattern";
import { cn } from "@/lib/cn";

interface PatternCardProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

export function PatternCard({
  asChild,
  className,
  children,
  ...props
}: PatternCardProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "relative flex flex-col justify-between gap-y-8 p-4",
        "bg-accent/70 outline-none",
        "transition-colors duration-200 ease-in-out",
        asChild && "group hover:bg-primary/10 focus-visible:bg-primary/10",
        asChild &&
          "outline-none ring-2 ring-transparent ring-offset-2 ring-offset-bg focus-visible:ring-primary",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function PatternCardIcon({
  className,
  ...props
}: React.ComponentProps<typeof Slot>) {
  return (
    <Slot
      className={cn(
        "size-6 text-fg transition-colors duration-200 ease-in-out",
        "group-hover:text-primary group-focus-visible:text-primary",
        className,
      )}
      {...props}
    />
  );
}

export function PatternCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-y-1.5", className)} {...props}></div>
  );
}

export function PatternCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "text-balance font-[450] text-xl leading-tight transition-colors duration-200 ease-in-out",
        "group-hover:text-fg group-focus-visible:text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function PatternCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-pretty text-fg-subtle text-sm leading-snug transition-colors duration-200 ease-in-out",
        "group-hover:text-fg group-focus-visible:text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function PatternCardPattern({
  className,
  ...props
}: React.ComponentProps<typeof Pattern>) {
  return (
    <Pattern
      {...props}
      className={cn(
        "-z-10 pointer-events-none absolute top-1 left-1 size-full text-fg/20",
        "md:top-1.5 md:left-1.5",
        "group-hover:text-primary/50 group-focus-visible:text-primary/50",
        "group-hover:top-0 group-hover:left-0 group-focus-visible:top-0 group-focus-visible:left-0",
        "transition-[color,top,left] duration-200 ease-in-out",
        className,
      )}
    />
  );
}

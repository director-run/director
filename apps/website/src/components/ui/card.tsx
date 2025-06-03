import { Slot } from "@radix-ui/react-slot";
import { ComponentProps } from "react";

import { cn } from "@/lib/cn";

interface CardProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export function Card({ className, children, asChild, ...props }: CardProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="card"
      className={cn(
        "popover shadow-[0_3px_9px_0px_rgba(55,50,46,0.07),_0_0_0_0.5px_rgba(55,50,46,0.15)]",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-y-2 p-4 sm:p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "p-4 sm:p-6 [[data-slot=card-header]+&]:border-t-[0.5px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "max-w-lg text-balance font-[450] text-lg leading-tight md:text-xl",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "max-w-lg text-pretty text-base text-fg-subtle leading-snug",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

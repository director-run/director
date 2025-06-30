import { cn } from "@director.run/design/lib/cn";
import { Card } from "@director.run/design/ui/card";
import type { ComponentProps } from "react";

interface NonIdealStateProps extends ComponentProps<typeof Card> {
  asChild?: boolean;
}

export function NonIdealState({
  children,
  className,
  ...props
}: NonIdealStateProps) {
  return (
    <Card
      className={cn("items-center gap-y-1.5 shadow-none", className)}
      spacing="md"
      variant="neutral"
      {...props}
    >
      {children}
    </Card>
  );
}

export function NonIdealStateTitle({
  children,
  className,
  ...props
}: ComponentProps<"h3">) {
  return (
    <h3 className={cn("text-[15px]", className)} {...props}>
      {children}
    </h3>
  );
}

export function NonIdealStateDescription({
  children,
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-[13px] text-content-secondary",
        "[&>a]:underline [&>a]:decoration-1 [&>a]:underline-offset-2",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

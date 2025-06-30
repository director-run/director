import { cn } from "@director.run/design/lib/cn";
import { Card } from "@director.run/design/ui/card";
import type { ComponentProps } from "react";

export function ActionCard({
  className,
  children,
  ...props
}: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "cursor-pointer select-none justify-between gap-y-6 bg-gradient-to-b from-surface-subtle to-surface-neutral text-left",
        className,
      )}
      interactive
      spacing="sm"
      {...props}
    >
      {children}
    </Card>
  );
}

export function ActionCardContent({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-y-1", className)} {...props}>
      {children}
    </div>
  );
}

export function ActionCardTitle({
  className,
  children,
  ...props
}: ComponentProps<"h3">) {
  return (
    <div
      className={cn(
        "flex flex-row items-center gap-x-2 text-[15px] leading-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ActionCardDescription({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "line-clamp-2 text-pretty text-[13px] text-content-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

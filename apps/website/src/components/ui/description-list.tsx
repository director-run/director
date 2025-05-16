import { cn } from "@/lib/cn";
import React from "react";

export function DescriptionList({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dl">) {
  return (
    <dl
      className={cn(
        "grid border border-border-subtle",
        "*:border-border-subtle *:px-2",
        "grid-cols-[auto_1fr] *:border-b *:py-1.5 *:leading-6 *:last-of-type:border-b-0",
        className,
      )}
      {...props}
    >
      {children}
    </dl>
  );
}

export function DescriptionTerm({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dt">) {
  return (
    <dt
      className={cn(
        "border-border-subtle border-r pt-1.5 text-foreground-subtle text-sm tracking-wide",
        className,
      )}
      {...props}
    >
      {children}
    </dt>
  );
}

export function DescriptionDetail({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"dd">) {
  return (
    <dd
      className={cn("border-b pt-1.5 pb-1.5 last:border-b-0", className)}
      {...props}
    >
      {children}
    </dd>
  );
}

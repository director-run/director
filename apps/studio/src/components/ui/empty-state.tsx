import { cn } from "@/lib/cn";
import { ComponentProps } from "react";

export function EmptyState({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-y-1 rounded-2xl bg-element px-4 py-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyStateTitle({
  children,
  className,
  ...props
}: ComponentProps<"h3">) {
  return (
    <h3 className={cn("text-foreground text-lg", className)} {...props}>
      {children}
    </h3>
  );
}

export function EmptyStateDescription({
  children,
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p className={cn("text-foreground-subtle text-sm", className)} {...props}>
      {children}
    </p>
  );
}

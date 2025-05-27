import { cn } from "@/lib/cn";
import { ComponentProps } from "react";
import { textVariants } from "./typography";

export function EmptyState({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-y-1 rounded-xl bg-accent-subtle px-4 py-6 text-fg",
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
    <h3 className={cn(textVariants({ variant: "h3" }), className)} {...props}>
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
    <p className={cn("text-[13px] text-fg-subtle", className)} {...props}>
      {children}
    </p>
  );
}

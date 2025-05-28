import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import { ComponentProps } from "react";
import { textVariants } from "./typography";

interface EmptyStateProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

export function EmptyState({
  children,
  className,
  asChild,
  ...props
}: EmptyStateProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(
        "flex flex-col items-center justify-center gap-y-1 rounded-xl bg-accent-subtle px-4 py-6 text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
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

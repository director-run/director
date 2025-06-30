import { cn } from "@director.run/design/lib/cn";
import type * as React from "react";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border bg-surface px-3 py-2 text-sm outline-none transition-[color,_background-color,_border-color,_box-shadow]",
        "field-sizing-content min-h-16 resize-none",
        "focus-visible focus-visible:border-base/50 disabled:cursor-not-allowed disabled:border-border/75 disabled:bg-surface-neutral",
        "aria-invalid:border-sentiment-negative aria-invalid:ring-sentiment-negative",
        className,
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

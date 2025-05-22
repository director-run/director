import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex w-full rounded-lg bg-element px-2.5 py-2 text-foreground text-sm transition-colors",
        "file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
        "placeholder:text-foreground-subtle/70 focus-visible:bg-element-hover focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

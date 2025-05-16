import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full border border-border-subtle bg-background-subtle px-2.5 py-1 text-foreground text-sm transition-colors",
        "file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
        "placeholder:text-foreground-faint focus-visible:border-foreground focus-visible:bg-background focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

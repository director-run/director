import * as React from "react";

import { cn } from "@/lib/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-sm bg-gray-3 px-3 py-1 text-sm tracking-wide transition-colors",
        "placeholder:text-gray-9 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "outline-none selection:bg-gray-12 selection:text-gray-1 focus-visible:bg-gray-5",
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20 dark:aria-invalid:border-red-900",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

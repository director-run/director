import * as React from "react";

import { cn } from "@/lib/cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content flex w-full resize-none border border-border-subtle bg-background-subtle px-2.5 py-1.5 text-foreground text-sm transition-colors",
        "file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
        "placeholder:text-foreground-faint focus-visible:border-foreground focus-visible:bg-background focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

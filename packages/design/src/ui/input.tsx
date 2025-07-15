import type * as React from "react";

import { cn } from "@director.run/design/lib/cn";
import { Conditional } from "./conditional";

interface InputProps extends React.ComponentProps<"input"> {
  wrapperClassName?: string;
}

export function Input({
  className,
  type,
  children,
  wrapperClassName,
  ...props
}: InputProps) {
  return (
    <Conditional
      condition={typeof children !== "undefined"}
      wrap={(child) => (
        <div className={cn("relative", wrapperClassName)}>
          {child}
          {children}
        </div>
      )}
    >
      <input
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md border bg-surface px-3 py-1 text-sm tracking-wide outline-none transition-[color,_background-color,_border-color,_box-shadow]",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground",
          "focus-visible focus-visible:border-base/50 disabled:cursor-not-allowed disabled:border-border/75 disabled:bg-surface-neutral",
          "aria-invalid:border-sentiment-negative aria-invalid:ring-sentiment-negative",
          className,
        )}
        data-slot="input"
        type={type}
        {...props}
      />
    </Conditional>
  );
}

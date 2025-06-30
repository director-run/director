"use client";

import { cn } from "@director.run/design/lib/cn";
import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer h-5.5 w-9 shrink-0 items-center rounded-full border-[0.5px] border-base/20 px-1 transition-all",
        "radix-state-[checked]:border-sentiment-positive/50 radix-state-[checked]:bg-sentiment-positive/10 radix-state-[unchecked]:bg-surface-neutral",
        "focus-visible",
        className,
      )}
      data-slot="switch"
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-3.5 rounded-full transition-transform",
          "radix-state-[checked]:bg-sentiment-positive radix-state-[unchecked]:bg-base dark:radix-state-[checked]:bg-green",
          "radix-state-[checked]:translate-x-[calc(100%)] radix-state-[unchecked]:translate-x-0",
        )}
        data-slot="switch-thumb"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

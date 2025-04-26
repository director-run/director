"use client";

import type { ComponentProps } from "react";
import { useState } from "react";

import { useInterval } from "@/hooks/use-interval";
import { cn } from "@/lib/cn";

export function Loader({
  className,
  ...props
}: Omit<ComponentProps<"span">, "children">) {
  const loading = "\\|/—";

  const [tick, setTick] = useState(0);

  useInterval(() => {
    setTick((prevTick) => (prevTick + 1) % loading.length);
  }, 100);

  return (
    <span className={cn("font-mono", className)} {...props}>
      [{loading[tick]}]
    </span>
  );
}

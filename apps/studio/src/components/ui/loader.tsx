"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "../../helpers/cn";

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

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay]);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

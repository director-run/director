import { useCallback, useEffect, useState } from "react";

type UseOnboardingProgressOptions = {
  key?: string;
};

export function useOnboardingProgress(options?: UseOnboardingProgressOptions) {
  const key = options?.key ?? "onBoardingInProgress";
  const [inProgress, setInProgressState] = useState<boolean>(false);

  // Read initial value on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.localStorage.getItem(key);
      setInProgressState(raw === "true");
    } catch {
      // ignore storage errors
    }
  }, [key]);

  const setInProgress = useCallback(
    (value: boolean) => {
      setInProgressState(value);
      if (typeof window === "undefined") {
        return;
      }
      try {
        window.localStorage.setItem(key, value ? "true" : "false");
      } catch {
        // ignore storage errors
      }
    },
    [key],
  );

  return { inProgress, setInProgress } as const;
}

import { useIsomorphicLayoutEffect } from "@director.run/design/hooks/use-isomorphic-layout";
import { useState } from "react";

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

const IS_SERVER = typeof window === "undefined";

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {},
): boolean {
  const getMatches = (q: string): boolean => {
    if (IS_SERVER) {
      return defaultValue;
    }
    return window.matchMedia(q).matches;
  };

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query);
    }
    return defaultValue;
  });

  // Handles the change event of the media query.
  function handleChange() {
    setMatches(getMatches(query));
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Use deprecated `addListener` and `removeListener` to support Safari < 14 (#135)
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener("change", handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener("change", handleChange);
      }
    };
  }, [query]);

  return matches;
}

export function useIsSmall() {
  return useMediaQuery("(width >= 40rem)");
}

export function useIsMedium() {
  return useMediaQuery("(width >= 48rem)");
}

export function useIsLarge() {
  return useMediaQuery("(width >= 64rem)");
}

export function useIsXLarge() {
  return useMediaQuery("(width >= 80rem)");
}

export function useIs2xLarge() {
  return useMediaQuery("(width >= 96rem)");
}

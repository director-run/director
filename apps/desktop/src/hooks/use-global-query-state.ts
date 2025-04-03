import { parseAsInteger, useQueryStates } from "nuqs";
import { useMemo } from "react";

interface GlobalQueryState {
  port: number;
}

type GlobalQueryStateKeys = keyof GlobalQueryState;

export const GLOBAL_QUERY_STATE_DEFAULTS: GlobalQueryState = {
  port: 3000,
};

export function useGlobalQueryState() {
  const [globalQueryState, setGlobalQueryState] = useQueryStates({
    port: parseAsInteger.withDefault(GLOBAL_QUERY_STATE_DEFAULTS.port),
  });

  const differences = useMemo(() => {
    const result: Partial<GlobalQueryState> = {};

    for (const key of Object.keys(GLOBAL_QUERY_STATE_DEFAULTS)) {
      const defaultValue = GLOBAL_QUERY_STATE_DEFAULTS[
        key as GlobalQueryStateKeys
      ] as unknown;
      const currentValue = globalQueryState[key as GlobalQueryStateKeys];
      if (defaultValue !== currentValue) {
        result[key as GlobalQueryStateKeys] = currentValue;
      }
    }

    return result;
  }, [globalQueryState]);

  return {
    state: globalQueryState,
    setState: setGlobalQueryState,
    differences,
  };
}

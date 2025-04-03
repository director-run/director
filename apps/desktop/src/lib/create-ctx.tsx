import { createContext, useContext } from "react";

/**
 * A helper to create a Context and Provider with no upfront default value, and
 * without having to check for undefined all the time.
 * @link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
 */
export function createCtx<T extends object>() {
  const ctx = createContext<T | undefined>(undefined);

  function useCtx() {
    const c = useContext(ctx);
    if (c === undefined) {
      throw new Error("useCtx must be inside a Provider with a value");
    }
    return c;
  }
  function Provider(props: {
    children: React.ReactNode;
    value: T;
  }) {
    return <ctx.Provider value={props.value}>{props.children}</ctx.Provider>;
  }

  return [useCtx, Provider] as const; // 'as const' makes TypeScript infer a tuple
}

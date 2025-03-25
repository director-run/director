"use client";

import { createCtx } from "@director.run/ui/lib/create-ctx";

export interface AppContext {
  downloads: {
    osx: string | null;
  };
  repo: {
    stars: number;
  };
}

const [useContext, Provider] = createCtx<AppContext>();

type AppContextProviderProps = React.PropsWithChildren<AppContext>;

export function AppContextProvider({
  children,
  ...value
}: AppContextProviderProps) {
  return <Provider value={value}>{children}</Provider>;
}

export const useAppContext = useContext;

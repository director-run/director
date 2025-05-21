import { useEffect, useState } from "react";

let hasEverMounted = false;

export function useIsClient() {
  const [isClient, setClient] = useState(hasEverMounted);

  useEffect(() => {
    setClient(true);
    hasEverMounted = true;
  }, []);

  return isClient;
}

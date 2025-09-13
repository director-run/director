"use client";

import { createSerializer, parseAsString, useQueryStates } from "nuqs";

const proxySearchParams = {
  registryId: parseAsString,
  serverId: parseAsString,
  toolId: parseAsString,
};

export const proxyQuerySerializer = createSerializer(proxySearchParams);

export function useProxyQuery() {
  const [proxyQuery, setProxyQuery] = useQueryStates(proxySearchParams);

  return {
    ...proxyQuery,
    setProxyQuery,
  };
}

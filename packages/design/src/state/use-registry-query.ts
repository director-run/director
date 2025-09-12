"use client";

import { createSerializer, parseAsString, useQueryStates } from "nuqs";

const registrySearchParams = {
  toolId: parseAsString,
  serverId: parseAsString,
};

export const registryQuerySerializer = createSerializer(registrySearchParams);

export function useRegistryQuery() {
  const [registryQuery, setRegistryQuery] =
    useQueryStates(registrySearchParams);

  return {
    ...registryQuery,
    setRegistryQuery,
  };
}

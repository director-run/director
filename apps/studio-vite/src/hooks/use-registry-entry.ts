import { registryClient } from "../contexts/gateway-context";

export function useRegistryEntry(params: {
  entryName?: string;
}) {
  return registryClient.entries.getEntryByName.useQuery(
    {
      name: params.entryName ?? "",
    },
    {
      enabled: !!params.entryName,
    },
  );
}

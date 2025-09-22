import { registryClient } from "../contexts/backend-context";

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

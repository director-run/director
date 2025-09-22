import { registryClient } from "../contexts/gateway-context";

export function useRegistryEntry(params: {
  entryName?: string;
}) {
  if (!params.entryName) {
    throw new Error("Entry name is required");
  }
  return registryClient.entries.getEntryByName.useQuery({
    name: params.entryName,
  });
}

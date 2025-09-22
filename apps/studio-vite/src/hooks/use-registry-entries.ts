import { registryClient } from "../contexts/gateway-context";

export function useRegistryEntries(params: {
  pageIndex: number;
  pageSize: number;
  searchQuery: string;
}) {
  return registryClient.entries.getEntries.useQuery(
    {
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
      searchQuery: params.searchQuery,
    },
    { placeholderData: (prev) => prev },
  );
}

import { gatewayClient } from "../contexts/backend-context";

export function useListTools(workspaceId: string, serverName?: string) {
  const { data, isLoading, error } = gatewayClient.tools.list.useQuery(
    { workspaceId: workspaceId, serverName: serverName },
    {
      throwOnError: false,
      retry: false,
    },
  );

  return {
    tools: data,
    isToolsLoading: isLoading,
    toolsError: error,
  };
}

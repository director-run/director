import { gatewayClient } from "../contexts/backend-context";

export function useListTools(playbookId: string, serverName?: string) {
  const { data, isLoading, error } = gatewayClient.tools.list.useQuery(
    { playbookId: playbookId, serverName: serverName },
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

import { gatewayClient } from "../contexts/backend-context";

export function useWorkspace(workspaceId: string) {
  const { data, isLoading, error } = gatewayClient.store.get.useQuery(
    { proxyId: workspaceId },
    {
      throwOnError: false,
      retry: false,
    },
  );

  return {
    workspace: data,
    isWorkspaceLoading: isLoading,
    workspaceError: error,
  };
}

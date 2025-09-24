import { gatewayClient } from "../contexts/backend-context";

export function useWorkspace(workspaceId: string) {
  return gatewayClient.store.get.useQuery(
    { proxyId: workspaceId },
    {
      throwOnError: false,
    },
  );
}

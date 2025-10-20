import { gatewayClient } from "../contexts/backend-context";

export function usePlaybook(playbookId: string) {
  const { data, isLoading, error } = gatewayClient.store.get.useQuery(
    { proxyId: playbookId },
    {
      throwOnError: false,
      retry: false,
    },
  );

  return {
    playbook: data,
    isPlaybookLoading: isLoading,
    playbookError: error,
  };
}

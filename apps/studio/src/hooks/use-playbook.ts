import { gatewayClient } from "../contexts/backend-context";

export function usePlaybook(playbookId: string) {
  const { data, isLoading, error } = gatewayClient.store.get.useQuery(
    { playbookId: playbookId },
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

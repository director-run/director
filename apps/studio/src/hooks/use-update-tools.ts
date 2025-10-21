import { gatewayClient } from "../contexts/backend-context";

type UpdateToolsOptions = {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
};

export function useUpdateTools(
  playbookId: string,
  options?: UpdateToolsOptions,
) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.tools.updateBatch.useMutation({
    onSuccess: async () => {
      await utils.tools.list.invalidate({ playbookId });
      if (options?.onSuccess) {
        await options.onSuccess();
      }
    },
    onError: async (error) => {
      if (options?.onError) {
        await options.onError(new Error(error.message));
      }
    },
  });

  const updateTools = async (
    tools: { name: string; disabled: boolean; serverName: string }[],
  ) => {
    await mutation.mutateAsync({
      playbookId,
      tools,
    });
  };

  return {
    updateTools,
    isPending: mutation.isPending,
  };
}

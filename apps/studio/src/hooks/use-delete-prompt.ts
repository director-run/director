import { gatewayClient } from "../contexts/backend-context.tsx";

type DeletePromptOptions = Parameters<
  typeof gatewayClient.store.removePrompt.useMutation
>[0];

export function useDeletePrompt(
  proxyId: string,
  options?: DeletePromptOptions,
) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.removePrompt.useMutation({
    async onSuccess(response, variables, context, meta) {
      await Promise.all([
        utils.store.get.invalidate({ proxyId }),
        utils.store.getAll.invalidate(),
        utils.store.listPrompts?.invalidate?.({ proxyId }),
      ]);
      if (options?.onSuccess) {
        await options.onSuccess(response, variables, context, meta);
      }
    },
    onError(error, variables, context, meta) {
      options?.onError?.(error, variables, context, meta);
    },
  });

  const deletePrompt = async (promptName: string) => {
    await mutation.mutateAsync({
      proxyId,
      promptName,
    });
  };

  return { deletePrompt, isPending: mutation.isPending };
}

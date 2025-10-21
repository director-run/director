import { gatewayClient } from "../contexts/backend-context.tsx";

type DeletePromptOptions = Parameters<
  typeof gatewayClient.store.removePrompt.useMutation
>[0];

export function useDeletePrompt(
  playbookId: string,
  options?: DeletePromptOptions,
) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.removePrompt.useMutation({
    async onSuccess(response, variables, context, meta) {
      await Promise.all([
        utils.store.get.invalidate({ playbookId }),
        utils.store.getAll.invalidate(),
        utils.store.listPrompts?.invalidate?.({ playbookId }),
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
      playbookId,
      promptName,
    });
  };

  return { deletePrompt, isPending: mutation.isPending };
}

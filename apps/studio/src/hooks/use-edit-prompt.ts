import { gatewayClient } from "../contexts/backend-context";

type EditPromptOptions = Parameters<
  typeof gatewayClient.store.updatePrompt.useMutation
>[0];

export function useEditPrompt(playbookId: string, options?: EditPromptOptions) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.updatePrompt.useMutation({
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

  const editPrompt = async (
    promptName: string,
    values: { title?: string; description?: string; body?: string },
  ) => {
    await mutation.mutateAsync({
      playbookId,
      promptName,
      prompt: {
        title: values.title,
        description: values.description,
        body: values.body,
      },
    });
  };

  return { editPrompt, isPending: mutation.isPending };
}

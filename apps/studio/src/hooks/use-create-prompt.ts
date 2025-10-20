import { gatewayClient } from "../contexts/backend-context";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type CreatePromptOptions = Parameters<
  typeof gatewayClient.store.addPrompt.useMutation
>[0];

export function useCreatePrompt(
  playbookId: string,
  options?: CreatePromptOptions,
) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.addPrompt.useMutation({
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

  const createPrompt = async (values: {
    title: string;
    description?: string;
    body: string;
  }) => {
    const name = slugify(values.title);
    await mutation.mutateAsync({
      playbookId,
      prompt: {
        name,
        title: values.title,
        description: values.description,
        body: values.body,
      },
    });
  };

  return { createPrompt, isPending: mutation.isPending };
}

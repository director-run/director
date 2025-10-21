import { gatewayClient } from "../contexts/backend-context";

type CreatePlaybookOptions = Parameters<
  typeof gatewayClient.store.create.useMutation
>[0];

export function useCreatePlaybook(options?: CreatePlaybookOptions) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.create.useMutation({
    async onSuccess(response, variables, context, meta) {
      await utils.store.getAll.refetch();
      if (options && options.onSuccess) {
        await options.onSuccess(response, variables, context, meta);
      }
    },
    onError(error, variables, context, meta) {
      if (options && options.onError) {
        options.onError(error, variables, context, meta);
      }
    },
  });

  return {
    createPlaybook: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

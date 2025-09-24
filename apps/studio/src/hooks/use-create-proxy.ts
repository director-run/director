import { gatewayClient } from "../contexts/backend-context";

type CreateProxyOptions = Parameters<
  typeof gatewayClient.store.create.useMutation
>[0];

export function useCreateProxy(options?: CreateProxyOptions) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.create.useMutation({
    async onSuccess(response, variables, context) {
      await utils.store.getAll.refetch();
      if (options && options.onSuccess) {
        await options.onSuccess(response, variables, context);
      }
    },
    onError(error, variables, context) {
      if (options && options.onError) {
        options.onError(error, variables, context);
      }
    },
  });

  return {
    createProxy: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

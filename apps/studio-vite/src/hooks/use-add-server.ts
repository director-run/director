import { gatewayClient } from "../contexts/gateway-context";

type AddServerMutationOptions = Parameters<
  typeof gatewayClient.store.addServer.useMutation
>[0];

export function useAddServer(options?: AddServerMutationOptions) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.addServer.useMutation({
    async onSuccess(data, variables, context) {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: variables.proxyId });
      if (options && options.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
    onError(error, variables, context) {
      if (options && options.onError) {
        options.onError(error, variables, context);
      }
    },
  });

  return {
    addServer: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

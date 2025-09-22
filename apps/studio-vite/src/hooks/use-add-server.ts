import { gatewayClient } from "../contexts/backend-context";

type AddServerMutationOptions = Parameters<
  typeof gatewayClient.store.addServer.useMutation
>[0];

export function useAddServer(options?: AddServerMutationOptions) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.addServer.useMutation({
    ...options,
    async onSuccess(data, variables, context) {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: variables.proxyId });
      await options?.onSuccess?.(data, variables, context);
    },
  });

  return {
    addServer: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

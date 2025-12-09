import { gatewayClient } from "../contexts/backend-context";

type AddHTTPServerMutationOptions = Parameters<
  typeof gatewayClient.store.addHTTPServer.useMutation
>[0];

type AddStdioServerMutationOptions = Parameters<
  typeof gatewayClient.store.addStdioServer.useMutation
>[0];

export function useAddHTTPServer(options?: AddHTTPServerMutationOptions) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.addHTTPServer.useMutation({
    ...options,
    async onSuccess(data, variables, context, meta) {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ playbookId: variables.playbookId });
      await options?.onSuccess?.(data, variables, context, meta);
    },
  });

  return {
    addHTTPServer: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export function useAddStdioServer(options?: AddStdioServerMutationOptions) {
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.addStdioServer.useMutation({
    ...options,
    async onSuccess(data, variables, context, meta) {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ playbookId: variables.playbookId });
      await options?.onSuccess?.(data, variables, context, meta);
    },
  });

  return {
    addStdioServer: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

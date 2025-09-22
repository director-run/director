import { gatewayClient, registryClient } from "../contexts/backend-context";

type InstallFromRegistryInput = {
  proxyId: string;
  entryName: string;
  parameters?: Record<string, string>;
};

type InstallFromRegistryOptions = Parameters<
  typeof gatewayClient.store.addServer.useMutation
>[0];

export function useInstallServerFromRegistry(
  options?: InstallFromRegistryOptions,
) {
  const gatewayUtils = gatewayClient.useUtils();
  const registryUtils = registryClient.useUtils();

  const addServerMutation = gatewayClient.store.addServer.useMutation({
    async onSuccess(data, variables, context) {
      await gatewayUtils.store.getAll.invalidate();
      if (variables?.proxyId) {
        await gatewayUtils.store.get.invalidate({ proxyId: variables.proxyId });
      }
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

  const install = async (input: InstallFromRegistryInput) => {
    const transport = await registryUtils.entries.getTransportForEntry.fetch({
      entryName: input.entryName,
      parameters: input.parameters ?? {},
    });

    const addServerInput = {
      proxyId: input.proxyId,
      server: {
        name: input.entryName,
        transport,
      },
    };

    return await addServerMutation.mutateAsync(addServerInput);
  };

  return {
    install,
    isPending: addServerMutation.isPending,
  };
}

import { gatewayClient, registryClient } from "../contexts/backend-context";

type InstallFromRegistryInput = {
  playbookId: string;
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
    async onSuccess(data, variables, context, meta) {
      if (data.connectionInfo?.status === "unauthorized") {
        const authRes = await gatewayUtils.store.authenticate.fetch({
          playbookId: variables.playbookId,
          serverName: data.name,
        });

        if (authRes.result === "REDIRECT") {
          window.location.assign(authRes.redirectUrl);
        }
        return;
      }

      await gatewayUtils.store.getAll.invalidate();
      if (variables?.playbookId) {
        await gatewayUtils.store.get.invalidate({
          playbookId: variables.playbookId,
        });
      }
      if (options && options.onSuccess) {
        await options.onSuccess(data, variables, context, meta);
      }
    },
    onError(error, variables, context, meta) {
      if (options && options.onError) {
        options.onError(error, variables, context, meta);
      }
    },
  });

  const install = async (input: InstallFromRegistryInput) => {
    const transport = await registryUtils.entries.getTransportForEntry.fetch({
      entryName: input.entryName,
      parameters: input.parameters ?? {},
    });

    const addServerInput = {
      playbookId: input.playbookId,
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

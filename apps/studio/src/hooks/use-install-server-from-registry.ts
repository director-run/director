import { gatewayClient } from "../contexts/backend-context";

type InstallFromRegistryInput = {
  playbookId: string;
  entryName: string;
  parameters?: Record<string, string>;
};

type InstallFromRegistryOptions = Parameters<
  typeof gatewayClient.store.addRegistryServer.useMutation
>[0];

export function useInstallServerFromRegistry(
  options?: InstallFromRegistryOptions,
) {
  const gatewayUtils = gatewayClient.useUtils();

  const addRegistryServerMutation =
    gatewayClient.store.addRegistryServer.useMutation({
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
    return await addRegistryServerMutation.mutateAsync({
      playbookId: input.playbookId,
      registryEntryName: input.entryName,
      parameters: input.parameters,
    });
  };

  return {
    install,
    isPending: addRegistryServerMutation.isPending,
  };
}

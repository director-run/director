import type { ClientNames } from "@director.run/client-configurator/index";
import { GATEWAY_URL } from "../config";
import { gatewayClient } from "../contexts/backend-context";

type ChangeInstallStateOptions = {
  onSuccess?: (client: ClientNames, install: boolean) => void | Promise<void>;
  onError?: (client: ClientNames, install: boolean) => void | Promise<void>;
};

export function useChangeInstallState(
  proxyId: string,
  options?: ChangeInstallStateOptions,
) {
  const utils = gatewayClient.useUtils();

  const installMutation = gatewayClient.clients.install.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.clients.allClients.invalidate();
      if (options?.onSuccess && variables?.client) {
        await options.onSuccess(variables.client as ClientNames, true);
      }
    },
    onError: async (_error, variables) => {
      if (options?.onError && variables?.client) {
        await options.onError(variables.client as ClientNames, true);
      }
    },
  });

  const uninstallMutation = gatewayClient.clients.uninstall.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.clients.allClients.invalidate();
      if (options?.onSuccess && variables?.client) {
        await options.onSuccess(variables.client as ClientNames, false);
      }
    },
    onError: async (_error, variables) => {
      if (options?.onError && variables?.client) {
        await options.onError(variables.client as ClientNames, false);
      }
    },
  });

  const changeInstallState = async (client: ClientNames, install: boolean) => {
    if (install) {
      await installMutation.mutateAsync({
        proxyId,
        client,
        baseUrl: GATEWAY_URL,
      });
    } else {
      await uninstallMutation.mutateAsync({
        proxyId,
        client,
      });
    }
  };

  return {
    changeInstallState,
    isPending: installMutation.isPending || uninstallMutation.isPending,
  };
}

import { GATEWAY_URL } from "../config";
import { gatewayClient } from "../contexts/backend-context";

type ChangeInstallStateOptions = {
  onSuccess?: (clientName: string, install: boolean) => void | Promise<void>;
  onError?: (clientName: string, install: boolean) => void | Promise<void>;
};

export function useChangeInstallState(
  workspaceId: string,
  options?: ChangeInstallStateOptions,
) {
  const utils = gatewayClient.useUtils();

  const installMutation = gatewayClient.clients.install.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.clients.allClients.invalidate();
      if (options?.onSuccess && variables?.clientId) {
        await options.onSuccess(variables.clientId, true);
      }
    },
    onError: async (_error, variables) => {
      if (options?.onError && variables?.clientId) {
        await options.onError(variables.clientId, true);
      }
    },
  });

  const uninstallMutation = gatewayClient.clients.uninstall.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.clients.allClients.invalidate();
      if (options?.onSuccess && variables?.clientId) {
        await options.onSuccess(variables.clientId, false);
      }
    },
    onError: async (_error, variables) => {
      if (options?.onError && variables?.clientId) {
        await options.onError(variables.clientId, false);
      }
    },
  });

  const changeInstallState = async (clientId: string, install: boolean) => {
    if (install) {
      await installMutation.mutateAsync({
        workspaceId,
        clientId,
        baseUrl: GATEWAY_URL,
      });
    } else {
      await uninstallMutation.mutateAsync({
        workspaceId,
        clientId,
      });
    }
  };

  return {
    changeInstallState,
    isPending: installMutation.isPending || uninstallMutation.isPending,
  };
}

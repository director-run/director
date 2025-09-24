import type { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { DIRECTOR_URL } from "../config";
import { trpc } from "../state/client";

type ChangeInstallStateOptions = {
  onSuccess?: (
    client: ConfiguratorTarget,
    install: boolean,
  ) => void | Promise<void>;
  onError?: (
    client: ConfiguratorTarget,
    install: boolean,
  ) => void | Promise<void>;
};

export function useChangeInstallState(
  proxyId: string,
  options?: ChangeInstallStateOptions,
) {
  const utils = trpc.useUtils();

  const installMutation = trpc.installer.byProxy.install.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.installer.byProxy.list.invalidate();
      if (options?.onSuccess && variables?.client) {
        await options.onSuccess(variables.client as ConfiguratorTarget, true);
      }
    },
    onError: async (_error, variables) => {
      if (options?.onError && variables?.client) {
        await options.onError(variables.client as ConfiguratorTarget, true);
      }
    },
  });

  const uninstallMutation = trpc.installer.byProxy.uninstall.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.installer.byProxy.list.invalidate();
      if (options?.onSuccess && variables?.client) {
        await options.onSuccess(variables.client as ConfiguratorTarget, false);
      }
    },
    onError: async (_error, variables) => {
      if (options?.onError && variables?.client) {
        await options.onError(variables.client as ConfiguratorTarget, false);
      }
    },
  });

  const changeInstallState = async (
    client: ConfiguratorTarget,
    install: boolean,
  ) => {
    if (install) {
      await installMutation.mutateAsync({
        proxyId,
        client,
        baseUrl: DIRECTOR_URL,
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

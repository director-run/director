import { useState } from "react";
import { gatewayClient } from "../contexts/backend-context";

type LogoutParams = {
  playbookId: string;
  serverName: string;
};

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const utils = gatewayClient.useUtils();

  const mutation = gatewayClient.store.logout.useMutation();

  const logout = async ({
    playbookId,
    serverName,
  }: LogoutParams): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await mutation.mutateAsync({ playbookId, serverName });
      // Invalidate relevant queries so UI refreshes auth state
      await utils.store.get.invalidate({ playbookId });
      await utils.store.getAll.invalidate();
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Logout failed");
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading, error };
}

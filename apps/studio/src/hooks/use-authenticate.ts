import { useState } from "react";
import { gatewayClient } from "../contexts/backend-context";

type AuthenticateParams = {
  proxyId: string;
  serverName: string;
};

type AuthenticateResponse =
  | { result: "AUTHORIZED" }
  | { result: "REDIRECT"; redirectUrl: string };

export function useAuthenticate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const utils = gatewayClient.useUtils();

  const authenticate = async ({
    proxyId,
    serverName,
  }: AuthenticateParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result: AuthenticateResponse = await utils.store.authenticate.fetch(
        {
          proxyId,
          serverName,
        },
      );

      if (result.result === "REDIRECT" && result.redirectUrl) {
        window.location.assign(result.redirectUrl);
        // Navigation is happening; return a value for completeness
        return false;
      }

      // Authorized: nothing else to do
      return true;
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Authentication failed");
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authenticate,
    isLoading,
    error,
  };
}

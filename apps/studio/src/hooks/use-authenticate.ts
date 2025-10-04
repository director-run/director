import { useEffect, useState } from "react";
import { gatewayClient } from "../contexts/backend-context";

type AuthenticateParams = {
  proxyId: string;
  serverName: string;
};

type AuthenticateResult =
  | { result: "AUTHORIZED" }
  | { result: "REDIRECT"; redirectUrl: string };

export function useAuthenticate() {
  const [params, setParams] = useState<AuthenticateParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pendingResolve, setPendingResolve] = useState<{
    resolve: (value: AuthenticateResult) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // Use a query that's enabled when params are set
  const authenticateQuery = gatewayClient.store.authenticate.useQuery(
    params || { proxyId: "", serverName: "" },
    {
      enabled: !!params,
    },
  );

  // Handle query results
  useEffect(() => {
    if (authenticateQuery.data && pendingResolve) {
      // If we get a redirect URL, open it in a new window
      if (
        authenticateQuery.data.result === "REDIRECT" &&
        authenticateQuery.data.redirectUrl
      ) {
        window.open(
          authenticateQuery.data.redirectUrl,
          "_blank",
          "noopener,noreferrer",
        );
      }

      setIsLoading(false);
      setParams(null); // Reset params to disable the query
      pendingResolve.resolve(authenticateQuery.data);
      setPendingResolve(null);
    } else if (authenticateQuery.error && pendingResolve) {
      const error =
        authenticateQuery.error instanceof Error
          ? authenticateQuery.error
          : new Error("Authentication failed");
      setError(error);
      setIsLoading(false);
      setParams(null); // Reset params to disable the query
      pendingResolve.reject(error);
      setPendingResolve(null);
    }
  }, [authenticateQuery.data, authenticateQuery.error, pendingResolve]);

  const authenticate = async (
    authenticateParams: AuthenticateParams,
  ): Promise<AuthenticateResult> => {
    setIsLoading(true);
    setError(null);
    setParams(authenticateParams);

    // Return a promise that resolves when the query completes
    return new Promise((resolve, reject) => {
      setPendingResolve({ resolve, reject });

      // Clean up after 10 seconds
      setTimeout(() => {
        if (pendingResolve) {
          setPendingResolve(null);
          reject(new Error("Authentication timeout"));
        }
      }, 10000);
    });
  };

  return {
    authenticate,
    isLoading,
    error,
  };
}

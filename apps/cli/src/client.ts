import {
  type GatewayClient,
  createGatewayClient,
} from "@director.run/gateway/client";
import { createRegistryClient } from "@director.run/registry/client";
import { TRPCClientError } from "@trpc/client";
import { env } from "./env";
import { getAuthToken, runLoginFlow } from "./utils/auth";

function createBaseGatewayClient(): GatewayClient {
  return createGatewayClient(env.GATEWAY_URL, {
    getAuthToken,
  });
}

let baseClient = createBaseGatewayClient();

function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.data?.code === "UNAUTHORIZED";
  }
  return false;
}

type DeepProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => Promise<infer R>
    ? (...args: A) => Promise<R>
    : DeepProxy<T[K]>;
};

function createAuthAwareProxy<T extends object>(
  getTarget: () => T,
  path: string[] = [],
): DeepProxy<T> {
  return new Proxy({} as DeepProxy<T>, {
    get(_target, prop: string) {
      const currentPath = [...path, prop];

      if (prop === "query" || prop === "mutate") {
        return async (...args: unknown[]) => {
          try {
            const target = getTarget();
            let current: unknown = target;
            for (const key of path) {
              current = (current as Record<string, unknown>)[key];
            }
            const method = (current as Record<string, unknown>)[prop] as (
              ...args: unknown[]
            ) => Promise<unknown>;
            return await method(...args);
          } catch (error) {
            if (isUnauthorizedError(error)) {
              const loginResult = await runLoginFlow();
              if (loginResult.success) {
                // Recreate the client with the new token
                baseClient = createBaseGatewayClient();
                // Retry the original request
                const target = getTarget();
                let current: unknown = target;
                for (const key of path) {
                  current = (current as Record<string, unknown>)[key];
                }
                const method = (current as Record<string, unknown>)[prop] as (
                  ...args: unknown[]
                ) => Promise<unknown>;
                return await method(...args);
              }
              // Login failed, re-throw the original error
              throw error;
            }
            throw error;
          }
        };
      }

      return createAuthAwareProxy(getTarget, currentPath);
    },
  });
}

export const gatewayClient = createAuthAwareProxy(
  () => baseClient,
) as unknown as GatewayClient;

export const registryClient = createRegistryClient(env.REGISTRY_URL, {
  apiKey: env.REGISTRY_API_KEY,
});

import { joinURL } from "@director.run/utilities/url";
import { createTRPCClient } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { AppRouter } from "./routers/trpc";

export function createGatewayClient(
  baseURL: string,
  options?: {
    getAuthToken?: () => string | null;
  },
) {
  const url = joinURL(baseURL, "/trpc");
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
        transformer: superjson,
        headers() {
          const authToken = options?.getAuthToken?.();
          if (authToken) {
            return {
              cookie: authToken,
            };
          }
          return {};
        },
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          }).catch((error) => {
            if (error.code === "ConnectionRefused") {
              throw new Error(
                `Could not connect to the gateway service on ${baseURL}. Is it running?`,
              );
            }
            throw error;
          });
        },
      }),
    ],
  });
}

export type GatewayClient = ReturnType<typeof createGatewayClient>;
export type GatewayRouterInputs = inferRouterInputs<AppRouter>;
export type GatewayRouterOutputs = inferRouterOutputs<AppRouter>;

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  sessionCookie: string;
}

export async function register(
  baseURL: string,
  params: {
    email: string;
    password: string;
  },
): Promise<AuthResponse> {
  const response = await fetch(joinURL(baseURL, "/api/auth/sign-up/email"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...params,
      name: params.email, // better-auth requires name, we use email as placeholder
    }),
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.statusText}`);
  }

  const data = await response.json();
  const sessionCookie = response.headers.get("set-cookie");

  if (!sessionCookie) {
    throw new Error("No session cookie returned from registration");
  }

  return {
    user: data.user,
    sessionCookie,
  };
}

export async function login(
  baseURL: string,
  params: {
    email: string;
    password: string;
  },
): Promise<AuthResponse> {
  const response = await fetch(joinURL(baseURL, "/api/auth/sign-in/email"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  const sessionCookie = response.headers.get("set-cookie");

  if (!sessionCookie) {
    throw new Error("No session cookie returned from login");
  }

  return {
    user: data.user,
    sessionCookie,
  };
}

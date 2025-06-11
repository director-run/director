import { createTRPCClient } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import type { AnyTRPCMiddlewareFunction } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { AnyRouter } from "@trpc/server";
import superjson from "superjson";
import { getLogger } from "./logger";

const logger = getLogger("trpc");

export const logTRPCRequest: AnyTRPCMiddlewareFunction = async ({
  path,
  type,
  next,
  input,
}) => {
  if (path === "health") {
    return next();
  }

  const start = Date.now();
  logger.trace(
    {
      path,
      type,
      input,
    },
    "trpc request received",
  );

  try {
    const result = await next();
    const duration = Date.now() - start;

    if (result.ok) {
      logger.trace(
        {
          path,
          type,
          duration,
        },
        "trpc request successful",
      );
    } else {
      logger.error(
        {
          path,
          type,
          duration,
          error: result.error,
        },
        "trpc request failed",
      );
    }
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(
      {
        path,
        type,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "trpc request failed",
    );
    throw error;
  }
};

export const trpcBase = initTRPC.context().create({
  transformer: superjson,
});

const baseProcedure = trpcBase.procedure.use(logTRPCRequest);

export const t = {
  router: trpcBase.router,
  procedure: baseProcedure,
  middleware: trpcBase.middleware,
};

export function createClient<TRouter extends AnyRouter>(
  baseUrl: string,
  baseOptions?: { headers?: Record<string, string> },
) {
  return createTRPCClient<TRouter>({
    links: [
      httpBatchLink({
        url: baseUrl,
        transformer:
          superjson as TRouter["_def"]["_config"]["$types"]["transformer"],
        async fetch(url, options) {
          return fetch(url, {
            ...options,
            headers: { ...baseOptions?.headers, ...options?.headers },
          }).catch((error) => {
            if (error.code === "ConnectionRefused") {
              throw new Error(
                `Could not connect to the service on ${baseUrl}. Is it running?`,
              );
            }
            throw error;
          });
        },
      }),
    ],
  });
}

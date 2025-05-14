import type { AnyTRPCMiddlewareFunction } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { getLogger } from "./logger";

const logger = getLogger("trpc");

export const logTRPCRequest: AnyTRPCMiddlewareFunction = async ({
  path,
  type,
  next,
  input,
}) => {
  const start = Date.now();
  logger.info(
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
    logger.info(
      {
        path,
        type,
        duration,
      },
      "trpc request completed",
    );
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
  transformer: SuperJSON,
});

const baseProcedure = trpcBase.procedure.use(logTRPCRequest);

export const t = {
  router: trpcBase.router,
  procedure: baseProcedure,
  middleware: trpcBase.middleware,
};

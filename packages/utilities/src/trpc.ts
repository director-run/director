import type { AnyTRPCMiddlewareFunction } from "@trpc/server";
import { TRPCError, initTRPC } from "@trpc/server";
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

export const trpcBase = initTRPC.context<object>().create({
  transformer: superjson,
  errorFormatter: ({ shape }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
      },
    };
  },
});

const baseProcedure = trpcBase.procedure.use(logTRPCRequest);

const enforceUserIsAuthed = trpcBase.middleware(({ ctx, next }) => {
  const contextWithUserId = ctx as { userId?: string };
  if (!contextWithUserId.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      userId: contextWithUserId.userId,
    },
  });
});

export const publicProcedure = baseProcedure;
export const protectedProcedure = baseProcedure.use(enforceUserIsAuthed);

export const t = {
  router: trpcBase.router,
  procedure: baseProcedure,
  middleware: trpcBase.middleware,
  publicProcedure,
  protectedProcedure,
};

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { getLogger } from "../../../helpers/logger";

const logger = getLogger("http/routers/trpc");

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

// Create logging middleware
export const loggingMiddleware = t.middleware(
  async ({ path, type, next, input }) => {
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
  },
);

export const createTRPCRouter = t.router;
export const loggedProcedure = t.procedure.use(loggingMiddleware);

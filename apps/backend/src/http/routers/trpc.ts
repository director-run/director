import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { getLogger } from "../../helpers/logger";
import {} from "../../services/installer/claude";
import {} from "../../services/installer/cursor";
import type { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import {} from "../../services/registry";
import { createInstallerRouter } from "./installer";
import { createRepositoryRouter } from "./repository";
import { createStoreRouter } from "./store";

const logger = getLogger("http/routers/trpc");

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

// Create logging middleware
const loggingMiddleware = t.middleware(async ({ path, type, next, input }) => {
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
});

const createTRPCRouter = t.router;

// Create a procedure with logging middleware
const loggedProcedure = t.procedure.use(loggingMiddleware);

export function createAppRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return createTRPCRouter({
    store: createStoreRouter({ proxyStore }),
    installer: createInstallerRouter({ proxyStore }),
    repository: createRepositoryRouter(),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

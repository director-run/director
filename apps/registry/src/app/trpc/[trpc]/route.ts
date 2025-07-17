import { createNextApiHandler } from "@trpc/server/adapters/next";

import { appRouter } from "../../../trpc/routers/_app";
import { createContext } from "../../../trpc/server";

const handler = createNextApiHandler({
  router: appRouter,
  createContext,
});

export { handler as GET, handler as POST };

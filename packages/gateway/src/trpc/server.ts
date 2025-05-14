import { logTRPCRequest } from "@director.run/utilities/trpc";
import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";

export const trpcBase = initTRPC.context().create({
  transformer: SuperJSON,
});

const baseProcedure = trpcBase.procedure.use(logTRPCRequest);

export const t = {
  router: trpcBase.router,
  procedure: baseProcedure,
  middleware: trpcBase.middleware,
};

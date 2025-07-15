import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// biome-ignore lint/suspicious/useAwait: OK
export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

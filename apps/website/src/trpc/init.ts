import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { UAParser } from "ua-parser-js";

export const createTRPCContext = async (opts: {
  headers: Headers;
}) => {
  const userAgentHeader = opts.headers.get("user-agent");

  return {
    userAgent: userAgentHeader ? UAParser(userAgentHeader) : null,
  };
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

import { AppError, ErrorCode } from "@director.run/utilities/error";
import { logTRPCRequest } from "@director.run/utilities/trpc";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// biome-ignore lint/suspicious/useAwait: OK
export const createTRPCContext = async (_opts: {
  headers: Headers;
}) => {
  const apiKey = _opts.headers.get("x-api-key");

  return {
    apiKey,
  };
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
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

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const baseProcedure = t.procedure.use(logTRPCRequest);

export const protectedProcedure = baseProcedure.use(function isAuthed(opts) {
  const apiKey = opts.ctx.apiKey;

  if (apiKey !== process.env.API_KEY) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Unauthorized");
  }

  return opts.next();
});

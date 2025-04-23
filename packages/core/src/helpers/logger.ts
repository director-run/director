import { env } from "@director.run/config/env";
import { omit, pick } from "lodash";
import pino, { type Logger } from "pino";
import pinoPretty from "pino-pretty";
import { isAppError } from "./error";

const logger = pino(
  {
    level: env.LOG_LEVEL.toLowerCase(),
    messageKey: "message",
    timestamp: true,
    serializers: {
      error: (error: Error) => {
        if (isAppError(error)) {
          return {
            type: error.name,
            ...pick(error, "message", "stack", "code", "props"),
            ...((error as Error).cause
              ? {
                  cause: pino.stdSerializers.errWithCause(error),
                }
              : {}),
          };
        }
        const serialized = pino.stdSerializers.errWithCause(error);
        return env.LOG_ERROR_STACK ? serialized : omit(serialized, "stack");
      },
    },
  },
  env.LOG_PRETTY
    ? pinoPretty({
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      })
    : undefined,
);

export const getLogger = (name: string): Logger => logger.child({ name });

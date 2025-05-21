import { omit, pick } from "lodash";
import pino, { type Logger } from "pino";
import pinoPretty from "pino-pretty";
import { isAppError } from "./error";

const LOG_LEVEL = "trace"; //;process.env.LOG_LEVEL ?? (isTest() ? "silent" : "trace");
const LOG_PRETTY = true;
const LOG_ERROR_STACK = true;

const logger = pino(
  {
    level: LOG_LEVEL.toLowerCase(),
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
        return LOG_ERROR_STACK ? serialized : omit(serialized, "stack");
      },
    },
  },
  LOG_PRETTY
    ? pinoPretty({
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      })
    : undefined,
);

export const getLogger = (name: string): Logger => logger.child({ name });

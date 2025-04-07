import { pick } from "lodash";
import pino, { type Logger } from "pino";
import pinoPretty from "pino-pretty";
import { isAppError } from "./error";

const LOG_PRETTY = process.env.LOG_PRETTY !== "false";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "trace";

const logger = pino(
  {
    level: LOG_LEVEL.toLowerCase(),
    messageKey: "message",
    timestamp: true,
    serializers: {
      error: (error: Error) =>
        isAppError(error)
          ? {
              type: error.name,
              ...pick(error, "message", "stack", "code", "props"),
              ...((error as Error).cause
                ? {
                    cause: pino.stdSerializers.errWithCause(error),
                  }
                : {}),
            }
          : pino.stdSerializers.errWithCause(error),
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

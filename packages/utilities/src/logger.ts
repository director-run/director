import { omit, pick } from "lodash";
import pino, { type Logger } from "pino";
import pinoPretty from "pino-pretty";
import { isTest } from "./env";
import { isAppError } from "./error";

const LOG_LEVEL = process.env.LOG_LEVEL ?? (isTest() ? "silent" : "info");
const LOG_PRETTY = process.env.LOG_PRETTY !== "false";
const LOG_ERROR_STACK = process.env.LOG_ERROR_STACK === "true";

const logger = pino(
  {
    level: LOG_LEVEL.toLowerCase(),
    messageKey: "message",
    timestamp: true,
    // TODO: redact sensitive data
    // redact: [""],
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
        // uncomment to hide json objects for any level other than trace or debug
        // hideObject: !["trace", "debug"].includes(LOG_LEVEL.toLowerCase()),
      })
    : undefined,
);

export const getLogger = (name: string): Logger => logger.child({ name });

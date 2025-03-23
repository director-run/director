// Simple logger interface that matches the basic pino Logger methods we use
export interface Logger {
  trace: (obj: object | string, msg?: string) => void;
  debug: (obj: object | string, msg?: string) => void;
  info: (obj: object | string, msg?: string) => void;
  warn: (obj: object | string, msg?: string) => void;
  error: (obj: object | string, msg?: string) => void;
}

/**
 * Creates a simple logger that uses console methods
 */
export const getLogger = (name: string): Logger => {
  const formatMessage = (msg?: string) =>
    msg ? `[${name}] ${msg}` : `[${name}]`;
  const formatObject = (obj: object | string) => {
    if (typeof obj === "string") {
      return formatMessage(obj);
    }
    return obj;
  };

  return {
    trace: (obj: object | string, msg?: string) => {
      if (typeof obj === "string") {
        console.debug(formatMessage(obj));
      } else {
        console.debug(formatMessage(msg), formatObject(obj));
      }
    },
    debug: (obj: object | string, msg?: string) => {
      if (typeof obj === "string") {
        console.debug(formatMessage(obj));
      } else {
        console.debug(formatMessage(msg), formatObject(obj));
      }
    },
    info: (obj: object | string, msg?: string) => {
      if (typeof obj === "string") {
        console.info(formatMessage(obj));
      } else {
        console.info(formatMessage(msg), formatObject(obj));
      }
    },
    warn: (obj: object | string, msg?: string) => {
      if (typeof obj === "string") {
        console.warn(formatMessage(obj));
      } else {
        console.warn(formatMessage(msg), formatObject(obj));
      }
    },
    error: (obj: object | string, msg?: string) => {
      if (typeof obj === "string") {
        console.error(formatMessage(obj));
      } else {
        console.error(formatMessage(msg), formatObject(obj));
      }
    },
  };
};

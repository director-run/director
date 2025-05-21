import { isNumber } from "lodash";

export type ExpressError = Error & {
  statusCode: number;
};

export class AppError extends Error {
  name = "AppError";

  constructor(
    public code: ErrorCode,
    message: string,
    public props: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

export enum ErrorCode {
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  CONNECTION_REFUSED = "CONNECTION_REFUSED",
  CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT",
  INVALID_URL = "INVALID_URL",
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isExpressError(error: unknown): error is ExpressError {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    isNumber(error.statusCode)
  );
}

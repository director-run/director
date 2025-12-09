import _ from "lodash";

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
  COMMAND_NOT_FOUND = "COMMAND_NOT_FOUND",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  CONNECTION_REFUSED = "CONNECTION_REFUSED",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  DUPLICATE = "DUPLICATE",
  JSON_PARSE_ERROR = "JSON_PARSE_ERROR",
  INVALID_ARGUMENT = "INVALID_ARGUMENT",
  INSECURE_FILE_PERMISSIONS = "INSECURE_FILE_PERMISSIONS",
  UNEXPECTED_ERROR = "UNEXPECTED_ERROR",
  INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
  CHILD_PROCESS_ERROR = "CHILD_PROCESS_ERROR",
  TIMEOUT = "TIMEOUT",
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isAppErrorWithCode(
  error: unknown,
  code: ErrorCode,
): error is AppError {
  return isAppError(error) && error.code === code;
}

export function isExpressError(error: unknown): error is ExpressError {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    _.isNumber(error.statusCode)
  );
}

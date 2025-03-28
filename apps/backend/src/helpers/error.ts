export class AppError extends Error {
  name = "ManagedError";

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
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;

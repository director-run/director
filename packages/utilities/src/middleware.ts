import {
  AppError,
  ErrorCode,
  isAppError,
  isExpressError,
} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

const logger = getLogger("http/middleware");

export const errorRequestHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
) => {
  const { status, message, code } = errorToHttpResponse(error);

  logger.error({
    message: `HTTP request failed: ${message}`,
  });

  res.status(status).json({ message, code });
};

export function errorToHttpResponse(error: unknown): {
  status: number;
  code?: string;
  message: string;
} {
  if (isAppError(error)) {
    return appErrorToHttpResponse(error);
  }
  if (isExpressError(error)) {
    return { status: error.statusCode, message: error.message };
  } else {
    return {
      status: 500,
      message: "Something unexpected happened :(",
    };
  }
}

function appErrorToHttpResponse(error: AppError) {
  let status: number;

  switch (error.code) {
    case ErrorCode.NOT_FOUND:
      status = 404;
      break;
    case ErrorCode.BAD_REQUEST:
      status = 400;
      break;
    default:
      status = 500;
  }

  return {
    status,
    message: error.message,
    code: error.code,
  };
}

/**
 * Wraps an async Express route handler to properly catch and forward errors
 * @param fn Async Express route handler
 * @returns Express middleware that handles Promise rejections
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

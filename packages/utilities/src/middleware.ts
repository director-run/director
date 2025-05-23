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
import pinoHttp from "pino-http";

const logger = getLogger("http/middleware");

export const errorRequestHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
) => {
  const { status, message, code } = errorToHttpResponse(error);

  logger.error({
    message: `${req.method} ${req.originalUrl} failed: ${message}`,
    code,
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

export function notFoundHandler() {
  throw new AppError(ErrorCode.NOT_FOUND, "there's nothing here");
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

export function logRequests() {
  return pinoHttp({
    logger,
    useLevel: "trace",
    // Ignore TRPC requests
    autoLogging: {
      ignore: (req) => (req as Request).originalUrl?.startsWith("/trpc"),
    },
    serializers: {
      req: (req) => ({
        id: req.id,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers["user-agent"],
      }),
      res: (res) => ({
        status: res.statusCode,
      }),
    },
    customReceivedMessage: (req) =>
      `→ ${req.method} ${(req as Request).originalUrl}`,
    customSuccessMessage: (req, res) => {
      const status = res.statusCode;
      const statusEmoji = status >= 500 ? "🔴" : status >= 400 ? "🟡" : "🟢";
      return `← ${req.method} ${(req as Request).originalUrl} ${statusEmoji} ${status}`;
    },
    customErrorMessage: (req, res) =>
      `← ${req.method} ${(req as Request).originalUrl} 🔴 ${res.statusCode}`,
  });
}

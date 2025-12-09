import { getLogger } from "@director.run/utilities/logger";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../auth";

const logger = getLogger("auth");

/**
 * Express Request with authenticated user.
 * Use this type in handlers that run after requireAPIKeyAuth middleware.
 */
export interface AuthenticatedRequest extends Request {
  userId: string;
}

/**
 * Express middleware that authenticates requests using better-auth.
 *
 * Supports both session cookies and API keys (via enableSessionForAPIKeys).
 * API key can be passed via x-api-key header, Authorization Bearer header,
 * or ?key= query param.
 *
 * After this middleware, req.userId is guaranteed to be set.
 * Use AuthenticatedRequest type for downstream handlers.
 */
export function requireAPIKeyAuth() {
  return async (
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const headers = fromNodeHeaders(req.headers);

      // Normalize API key from various sources into x-api-key header
      // (better-auth's customAPIKeyGetter checks x-api-key header)
      const authHeader = req.headers.authorization;
      const queryKey = req.query.key;

      if (authHeader?.startsWith("Bearer dk_")) {
        headers.set("x-api-key", authHeader.slice(7));
      } else if (typeof queryKey === "string" && queryKey.startsWith("dk_")) {
        headers.set("x-api-key", queryKey);
      }

      // Get session - works with cookies or API key (via x-api-key header)
      const session = await auth.api.getSession({ headers });

      if (!session?.user) {
        logger.debug({
          message: "no valid session or API key",
          path: req.path,
        });
        res.status(401).json({
          error: "Authentication required",
          message: "Provide a session cookie or API key",
        });
        return;
      }

      req.userId = session.user.id;
      next();
    } catch (error) {
      logger.error({ message: "authentication error", error });
      res.status(500).json({
        error: "Authentication error",
        message: "An error occurred during authentication",
      });
    }
  };
}

// export function fakeAPIKeyAuth(database: Database): express.RequestHandler {
//   return async (
//     req: express.Request & { userId?: string },
//     _: express.Response,
//     next: NextFunction,
//   ) => {
//     const user = await database.getUserByEmail("user@director.run");
//     if (!user) {
//       throw new Error("User not found");
//     }
//     req.userId = user.id;
//     next(null);
//   };
// }

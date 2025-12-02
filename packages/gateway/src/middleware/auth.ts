import { getLogger } from "@director.run/utilities/logger";
import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../auth";

const logger = getLogger("auth");

// Extend Express Request type to include userId
declare global {
  // biome-ignore lint/style/noNamespace: Required for Express type augmentation
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Express middleware that authenticates requests using better-auth.
 *
 * Supports both session cookies and API keys (via enableSessionForAPIKeys).
 * API key can be passed via x-api-key header, Authorization Bearer header,
 * or ?key= query param.
 *
 * Attaches userId to the request object for downstream handlers.
 */
export function createAuthMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
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

import { getLogger } from "@director.run/utilities/logger";
import { asyncHandler } from "@director.run/utilities/middleware/index";
import express, { type Request, type Response } from "express";

const logger = getLogger("oauth/callback-router");

type MaybePromise<T> = T | Promise<T>;
type RedirectResult = { redirectUrl: string };

export type GetSessionFn = (
  req: Request,
) => MaybePromise<{ userId: string } | null>;

export function createOauthCallbackRouter(params: {
  getSession: GetSessionFn;
  onAuthorizationSuccess: (
    factoryId: string,
    providerId: string,
    code: string,
    userId: string,
  ) => MaybePromise<void | RedirectResult>;
  onAuthorizationError: (
    factoryId: string,
    providerId: string,
    error: Error,
  ) => MaybePromise<void | RedirectResult>;
}): express.Router {
  const router = express.Router();

  router.get(
    "/oauth/:factoryId/:providerId/callback",
    asyncHandler(async (req: Request, res: Response) => {
      const code = req.query.code?.toString();
      const error = req.query.error?.toString();

      const factoryId = req.params.factoryId;
      const providerId = req.params.providerId;

      // Get the authenticated user from the session
      const session = await params.getSession(req);
      if (!session) {
        logger.error({
          message: "oauth callback received without authenticated session",
          factoryId,
          providerId,
        });
        res.status(401).send({
          status: "error",
          message: "Authentication required. Please log in before authorizing.",
        });
        return;
      }
      const userId = session.userId;

      if (code) {
        logger.info({
          message: "received oauth callback, authorization successful",
        });

        const result = await params.onAuthorizationSuccess(
          factoryId,
          providerId,
          code,
          userId,
        );

        if (result?.redirectUrl) {
          res.redirect(result.redirectUrl);
        } else {
          res.send({
            status: "success",
            message:
              "Authorization successful, you can close this window and return to the terminal.",
          });
        }
      } else if (error) {
        logger.error({
          message: "received oauth callback, authorization failed",
          error,
        });

        const result = await params.onAuthorizationError(
          factoryId,
          providerId,
          new Error(`OAuth authorization failed: ${error}`),
        );

        if (result?.redirectUrl) {
          res.redirect(result.redirectUrl);
        } else {
          res.status(400).send({
            status: "error",
            message: `oauth authorization failed: ${error}`,
          });
        }
      } else {
        logger.error({
          message: "received oauth callback, no authorization code or error",
        });

        const result = await params.onAuthorizationError(
          factoryId,
          providerId,
          new Error("No authorization code provided"),
        );

        if (result?.redirectUrl) {
          res.redirect(result.redirectUrl);
        } else {
          res.status(400).send({
            status: "error",
            message: "no authorization code or error in callback",
          });
        }
      }
    }),
  );

  return router;
}

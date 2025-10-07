import { getLogger } from "@director.run/utilities/logger";
import { asyncHandler } from "@director.run/utilities/middleware/index";
import { decodeUrl } from "@director.run/utilities/url";
import express, { type Request, type Response } from "express";

const logger = getLogger("oauth/callback-router");

export function createOauthCallbackRouter(params: {
  onAuthorizationSuccess: (
    clientId: string,
    code: string,
  ) => void | Promise<void>;
  onAuthorizationError: (
    clientId: string,
    error: Error,
  ) => void | Promise<void>;
}) {
  const router = express.Router();

  router.get(
    "/oauth/:clientId/callback",
    asyncHandler(async (req: Request, res: Response) => {
      const code = req.query.code?.toString();
      const error = req.query.error?.toString();
      const clientId = req.params.clientId;
      const serverUrl = decodeUrl(clientId);

      if (code) {
        logger.info({
          message: "received oauth callback, authorization successful",
        });

        await params.onAuthorizationSuccess(serverUrl, code);

        res.send({
          status: "success",
          message:
            "Authorization successful, you can close this window and return to the terminal.",
        });
      } else if (error) {
        logger.error({
          message: "received oauth callback, authorization failed",
          error,
        });

        await params.onAuthorizationError(
          serverUrl,
          new Error(`OAuth authorization failed: ${error}`),
        );

        res.status(400).send({
          status: "error",
          message: `oauth authorization failed: ${error}`,
        });
      } else {
        logger.error({
          message: "received oauth callback, no authorization code or error",
        });

        await params.onAuthorizationError(
          serverUrl,
          new Error("No authorization code provided"),
        );

        res.status(400).send({
          status: "error",
          message: "no authorization code or error in callback",
        });
      }
    }),
  );

  return router;
}

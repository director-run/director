import { getLogger } from "@director.run/utilities/logger";
import express, { type Request, type Response } from "express";

const logger = getLogger("oauth/callback-router");

export function createOauthCallbackRouter(params: {
  onAuthorizationSuccess: (code: string) => void;
  onAuthorizationError: (error: Error) => void;
}) {
  const router = express.Router();

  router.get("/callback", (req: Request, res: Response) => {
    const code = req.query.code?.toString();
    const error = req.query.error?.toString();

    if (code) {
      logger.info({
        message: "received oauth callback, authorization successful",
      });

      res.send({
        status: "success",
        message:
          "Authorization successful, you can close this window and return to the terminal.",
      });

      params.onAuthorizationSuccess(code);
    } else if (error) {
      logger.error({
        message: "received oauth callback, authorization failed",
        error,
      });

      res.status(400).send({
        status: "error",
        message: `oauth authorization failed: ${error}`,
      });

      params.onAuthorizationError(
        new Error(`OAuth authorization failed: ${error}`),
      );
    } else {
      logger.error({
        message: "received oauth callback, no authorization code or error",
      });

      res.status(400).send({
        status: "error",
        message: "no authorization code or error in callback",
      });

      params.onAuthorizationError(new Error("No authorization code provided"));
    }
  });

  return router;
}

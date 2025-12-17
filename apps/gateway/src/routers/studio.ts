import { isDevelopment } from "@director.run/utilities/env";
import { getLogger } from "@director.run/utilities/logger";
import { spaMiddleware } from "@director.run/utilities/middleware/spa";
import express from "express";
import { env } from "../env";

const logger = getLogger("studio_router");

export function createStudioRouter({
  assetsPath,
}: {
  assetsPath?: string;
}): express.Router {
  const router = express.Router();
  if (assetsPath) {
    logger.debug({
      message: "serving studio assets from",
      distPath: assetsPath,
    });
    router.use(
      "/studio",
      spaMiddleware({
        distPath: assetsPath,
        config: {
          basePath: "/studio",
          gatewayUrl: env.BASE_URL,
          registryUrl: env.REGISTRY_URL,
        },
      }),
    );

    router.get("/", (_, res) => {
      res.redirect("/studio");
    });
  } else if (isDevelopment()) {
    router.use("/studio", (req, res) => {
      res.redirect(`http://localhost:3000${req.originalUrl}`);
    });
  }

  return router;
}

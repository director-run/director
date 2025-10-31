import fs from "fs";
import path from "path";
import express from "express";

export const spaMiddleware = (options: {
  distPath: string;
  config?: Record<string, unknown>;
}): express.Router => {
  const { distPath, config } = options;
  const indexPath = path.join(distPath, "index.html");

  // Create a router to handle all middleware logic
  const router = express.Router();

  // Helper function to serve index.html with optional config injection
  const serveIndex = (_req: express.Request, res: express.Response) => {
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("index.html not found");
    }

    let html = fs.readFileSync(indexPath, "utf-8");

    // Inject configuration if available
    if (config) {
      html = html.replace(
        "</head>",
        `    <script>
      window.__APP_CONFIG__ = ${JSON.stringify(config)};
    </script>
    </head>`,
      );
    }

    res.type("html").send(html);
  };

  // Intercept requests for index.html (including "/")
  router.get(["/", "/index.html"], serveIndex);

  // Serve static files
  router.use(express.static(distPath));

  // Fallback to index.html for client-side routing
  router.get("*", serveIndex);

  return router;
};

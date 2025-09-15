import fs from "fs";
import path from "path";
import type { Request, Response } from "express";

export const createSPAMiddleware = (options: {
  distPath: string;
  config: Record<string, unknown>;
}) => {
  const { distPath, config } = options;

  return (req: Request, res: Response) => {
    const indexPath = path.join(distPath, "index.html");

    if (!fs.existsSync(indexPath)) {
      return res.status(404).send(`
        <h1>Application not built</h1>
        <p>Please run <code>npm run build</code> first to generate the dist folder.</p>
        <p>Looking for: ${indexPath}</p>
      `);
    }

    try {
      let html = fs.readFileSync(indexPath, "utf8");

      // Inject configuration if available
      if (req.appConfig) {
        html = html.replace(
          "</head>",
          `    <script>
            window.__APP_CONFIG__ = ${JSON.stringify(config)};
        </script>
    </head>`,
        );
      }

      res.send(html);
    } catch (error) {
      console.error("Error serving SPA:", error);
      res.status(500).send("Internal Server Error");
    }
  };
};

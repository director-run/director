import path from "path";
import { fileURLToPath } from "url";
import url from "url";
import { openUrl } from "@director.run/utilities/os";
import express from "express";
import { spaMiddleware } from "./middleware/spa";

const app = express();
const PORT = process.env.PORT || 8080;
const BASE_PATH = process.env.BASE_PATH || "/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  appName: process.env.APP_NAME || "Hello World SPA",
  apiUrl: process.env.API_URL || "http://localhost:3001",
  environment: process.env.NODE_ENV || "production",
  version: process.env.APP_VERSION || "1.0.0",
  basePath: BASE_PATH,
};

// Handle both root ("/") and subpath (e.g. "/studio") deployment
if (BASE_PATH === "/") {
  app.use(
    spaMiddleware({
      distPath: path.join(__dirname, "../dist"),
      config,
    }),
  );
} else {
  app.use(
    BASE_PATH,
    spaMiddleware({
      distPath: path.join(__dirname, "../dist"),
      config,
    }),
  );
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

await openUrl(url.resolve(`http://localhost:${PORT}`, BASE_PATH));

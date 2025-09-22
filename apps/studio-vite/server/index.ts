import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { spaMiddleware } from "./middleware/spa.js";

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  appName: process.env.APP_NAME || "Hello World SPA",
  apiUrl: process.env.API_URL || "http://localhost:3001",
  environment: process.env.NODE_ENV || "production",
  version: process.env.APP_VERSION || "1.0.0",
};

app.use(
  "/",
  spaMiddleware({
    distPath: path.join(__dirname, "../dist"),
    config,
  }),
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

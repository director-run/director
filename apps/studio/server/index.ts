import path from "path";
import url from "url";
import { spaMiddleware } from "@director.run/utilities/middleware/spa";
import { openUrl } from "@director.run/utilities/os";
import express from "express";

const app = express();
const PORT = process.env.PORT || 8080;
const BASE_PATH = process.env.BASE_PATH || "/";

const config = {
  basePath: BASE_PATH,
};

app.use(
  BASE_PATH,
  spaMiddleware({
    distPath: path.join(__dirname, "../dist"),
    config,
  }),
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

await openUrl(url.resolve(`http://localhost:${PORT}`, BASE_PATH));

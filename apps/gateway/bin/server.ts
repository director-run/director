import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { Database } from "../src/db/database";
import { env } from "../src/env";
import { Gateway } from "../src/gateway";

function getStudioAssetsPath(): string | undefined {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const assetsPath = path.join(__dirname, "./studio");
  const indexPath = path.join(assetsPath, "index.html");

  // Only return the path if the studio assets actually exist
  if (fs.existsSync(indexPath)) {
    return assetsPath;
  }
  return undefined;
}

async function start() {
  const database = Database.create(env.DATABASE_URL);

  await Gateway.start({
    database,
    port: env.PORT,
    studioAssetsPath: getStudioAssetsPath(),
  });
}

await start();

import path from "path";
import { fileURLToPath } from "url";
import { Database } from "../src/db/database";
import { env } from "../src/env";
import { Gateway } from "../src/gateway";

// KEEP THIS COMMENTED OUT FOR NOW
// const logger = getLogger("Server");

// const getStudioAssetsPath = (): string | undefined => {
//   const __dirname = path.dirname(fileURLToPath(import.meta.url));

//   const candidates = [
//     path.join(__dirname, "../../../dist/studio/index.html"), // development
//     path.join(__dirname, "./studio/index.html"), // compiled JS
//   ];

//   logger.debug({
//     message: "attempting to resolve studio dist path",
//     candidates,
//   });

//   const match = findFirstMatch(candidates);
//   return match ? path.dirname(match) : undefined;
// };

async function start() {
  const database = Database.create(env.DATABASE_URL);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const assetsPath = path.join(__dirname, "./studio");

  await Gateway.start({
    database,
    baseUrl: env.BASE_URL,
    port: env.PORT,
    studioAssetsPath: assetsPath,
    oauth: {
      storage: "memory",
      baseCallbackUrl: env.BASE_URL,
    },
  });
}

await start();

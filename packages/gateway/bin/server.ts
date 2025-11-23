import path from "path";
import { fileURLToPath } from "url";
import { createStore } from "../src/db";
import { DATABASE_URL, SERVER_PORT } from "../src/env";
import { Gateway } from "../src/gateway";

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
  const dbStore = createStore({ connectionString: DATABASE_URL }).playbooks;

  console.log("--------------------------------");
  console.log("--------------------------------");
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const assetsPath = path.join(__dirname, "./studio/index.html");
  console.log(assetsPath);
  console.log("--------------------------------");
  console.log("--------------------------------");

  await Gateway.start({
    dbStore,
    baseUrl: `http://localhost:${SERVER_PORT}`,
    port: SERVER_PORT,
    studioAssetsPath: assetsPath,
    oauth: {
      storage: "memory",
      baseCallbackUrl: `http://localhost:${SERVER_PORT}`,
    },
  });
}

await start();

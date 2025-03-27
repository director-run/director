console.log("Environment variables:");
console.log(process.env);
console.log("----------------");
console.log("----------------");
console.log("----------------");
console.log("----------------");

import { CONFIG_FILE_PATH } from "../src/config/env";
import { startServer } from "../src/http/server";
import { getPrismaClient } from "../src/services/getPrismaClient";
import { listProxies } from "../src/services/listProxies";

// Initialize the PrismaClient
const prisma = getPrismaClient();

console.log(`CONFIG_FILE_PATH: ${CONFIG_FILE_PATH}`);
console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL);
console.log("----------------");

console.log("__dirname: ", __dirname);
console.log("__filename: ", __filename);
console.log("----------------");

console.log("prisma dirname", prisma._engine.config.dirname);
console.log("prisma datamodelPath", prisma._engine.config.datamodelPath);
console.log("prisma cwd", prisma._engine.config.cwd);
console.log("prisma env", prisma._engine.config.env);

console.log("----------------");
console.log("----------------");
console.log("----------------");
console.log("----------------");

// const proxyData = {
//   name: "test-command-prxy",
//   servers: [
//     {
//       name: "Command Server",
//       transport: {
//         command: "uvx",
//         args: ["--from", "git+https://github.com/example/repo", "example"],
//       },
//     },
//   ],
// };

// Act
// await addProxy(proxyData);

const proxies = await listProxies();
console.log("Proxies:", proxies.length);

startServer();

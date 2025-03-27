console.log("Environment variables:");
console.log(process.env);
console.log("----------------");
console.log("----------------");
console.log("----------------");
console.log("----------------");

import { startServer } from "../src/http/server";
import { listProxies } from "../src/services/listProxies";

import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { CONFIG_FILE_PATH } from "../src/config/env";

// Initialize the PrismaClient
const prisma = new PrismaClient();

console.log(`Config file path: ${CONFIG_FILE_PATH}`);
console.log("database URL", process.env.DATABASE_URL);
console.log(
  `Prisma sqlite file: ${path.resolve(process.env.DATABASE_URL ?? "?")}`,
);
console.log("Directory name", __dirname);
console.log("File name", __filename);
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

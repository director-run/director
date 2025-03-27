console.log("Environment variables:");
console.log("----------------");
console.log(process.env);

import { startServer } from "../src/http/server";
import { listProxies } from "../src/services/listProxies";

import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { CONFIG_FILE_PATH } from "../src/config/env";
import { readConfig } from "../src/config/readConfig";

// Initialize the PrismaClient
const prisma = new PrismaClient();

const config = await readConfig(CONFIG_FILE_PATH);

console.log(`Config file path: ${CONFIG_FILE_PATH}`);
console.log("Config:");
console.log(JSON.stringify(config));
// Log the DATABASE_URL environment variable instead
console.log(
  `Prisma sqlite file: ${path.resolve(process.env.DATABASE_URL ?? "?")}`,
);

const proxyData = {
  name: "test-command-prxy",
  servers: [
    {
      name: "Command Server",
      transport: {
        command: "uvx",
        args: ["--from", "git+https://github.com/example/repo", "example"],
      },
    },
  ],
};

// Act
// await addProxy(proxyData);

const proxies = await listProxies();
console.log("Proxies:");
console.log("----------------");
console.log(proxies);

startServer();

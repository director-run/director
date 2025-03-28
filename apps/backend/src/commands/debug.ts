import * as config from "../config/env";
// import { getPrismaClient } from "../services/getPrismaClient";

export async function debug() {
  console.log("Environment variables:");
  console.log(process.env);
  console.log("----------------");
  console.log("----------------");
  console.log("----------------");
  console.log("----------------");

  // Initialize the PrismaClient
  //   const prisma = getPrismaClient();

  console.log("----------------");
  console.log("__dirname: ", __dirname);
  console.log("__filename: ", __filename);
  console.log(`config:`, config);

  //   console.log("----------------");

  //   console.log("----------------");
  //   console.log("----------------");
  //   console.log("----------------");
  console.log("----------------");
  //   const proxies = await listProxies();
  //   console.log("Proxies:", proxies.length);
}

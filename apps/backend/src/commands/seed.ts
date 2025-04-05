import { writeStore } from "@director.run/store";
import type { Config } from "@director.run/store/schema";
import { PROXY_DB_FILE_PATH } from "../config";
import { getLogger } from "../helpers/logger";

export async function seed() {
  const logger = getLogger("seed");
  logger.info(`Seeding database at path: ${PROXY_DB_FILE_PATH}`);
  const seedProxyDB: Config = {
    version: "beta",
    port: 3000,
    proxies: [
      {
        id: "my-first-proxy",
        name: "my-first-proxy",
        servers: [
          {
            name: "Hackernews",
            transport: {
              type: "stdio",
              command: "uvx",
              args: [
                "--from",
                "git+https://github.com/erithwik/mcp-hn",
                "mcp-hn",
              ],
            },
          },
          {
            name: "Fetch",
            transport: {
              type: "stdio",
              command: "uvx",
              args: ["mcp-server-fetch"],
            },
          },
        ],
      },
    ],
  };

  await writeStore(seedProxyDB, PROXY_DB_FILE_PATH);
}

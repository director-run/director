import { writeConfig } from "../config";
import type { Config } from "../config/schema";
import { PROXY_DB_FILE_PATH } from "../constants";
import { getLogger } from "../helpers/logger";

export async function seed() {
  const logger = getLogger("seed");
  logger.info(`Seeding database at path: ${PROXY_DB_FILE_PATH}`);
  const seedProxyDB: Config = {
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

  await writeConfig(seedProxyDB, PROXY_DB_FILE_PATH);
}

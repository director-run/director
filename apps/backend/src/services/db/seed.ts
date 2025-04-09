import { writeConfigFile } from ".";
import { PROXY_DB_FILE_PATH } from "../../constants";
import { getLogger } from "../../helpers/logger";
import type { Config } from "./schema";

const logger = getLogger("config/seed");

export async function seed() {
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
  await writeConfigFile(seedProxyDB, PROXY_DB_FILE_PATH);
}

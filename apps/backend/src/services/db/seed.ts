import { writeDBFile } from ".";
import { PROXY_DB_FILE_PATH } from "../../config";
import { getLogger } from "../../helpers/logger";
import type { DatabaseSchema } from "./schema";

const logger = getLogger("config/seed");

export async function seed() {
  logger.info(`Seeding database at path: ${PROXY_DB_FILE_PATH}`);
  const seedProxyDB: DatabaseSchema = {
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
  await writeDBFile(seedProxyDB, PROXY_DB_FILE_PATH);
}

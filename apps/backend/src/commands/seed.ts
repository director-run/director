import { DB_FILE_PATH } from "../config";
import { getLogger } from "../helpers/logger";
import { writeJSONFile } from "../helpers/writeJSONFile";
import type { ConfigDB } from "../services/store/types";

export async function seed() {
  const logger = getLogger("seed");
  logger.info(`Seeding database at path: ${DB_FILE_PATH}`);
  const seedProxyDB: ConfigDB = {
    proxies: [
      {
        name: "my-first-proxy",
        servers: [
          {
            name: "Hackernews",
            transport: {
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
              command: "uvx",
              args: ["mcp-server-fetch"],
            },
          },
        ],
      },
    ],
  };

  await writeJSONFile<ConfigDB>(DB_FILE_PATH, seedProxyDB);
}

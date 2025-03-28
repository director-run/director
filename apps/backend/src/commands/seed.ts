import { PROXY_DB_FILE_PATH } from "../env";
import { getLogger } from "../helpers/logger";
import { writeJSONFile } from "../helpers/writeJSONFile";
import type { ProxyDB } from "../services/store";

export async function seed() {
  const logger = getLogger("seed");
  logger.info(`Seeding database at path: ${PROXY_DB_FILE_PATH}`);
  const seedProxyDB: ProxyDB = {
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

  await writeJSONFile<ProxyDB>(PROXY_DB_FILE_PATH, seedProxyDB);
}

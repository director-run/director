import { db } from ".";
import { DB_FILE_PATH } from "../../config";
import { getLogger } from "../../helpers/logger";

const logger = getLogger("config/seed");

export async function seed() {
  logger.info(`Seeding database at path: ${DB_FILE_PATH}`);

  await db.purge();
  await db.addProxy({
    name: "claude-proxy",
    integrations: [],
    servers: [
      {
        name: "Fetch",
        transport: {
          type: "stdio",
          command: "uvx",
          args: ["mcp-server-fetch"],
        },
      },
      {
        name: "Hackernews",
        transport: {
          type: "stdio",
          command: "uvx",
          args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
        },
      },
    ],
  });

  await db.addProxy({
    name: "inspector-proxy",
    integrations: [],
    servers: [
      {
        name: "Fetch",
        transport: {
          type: "stdio",
          command: "uvx",
          args: ["mcp-server-fetch"],
        },
      },
    ],
  });

  await db.addProxy({
    name: "cursor-proxy",
    integrations: [],
    servers: [
      {
        name: "Hackernews",
        transport: {
          type: "stdio",
          command: "uvx",
          args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
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
  });
}

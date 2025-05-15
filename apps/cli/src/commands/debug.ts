import { Database } from "@director.run/gateway/db/index";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { getLogger } from "@director.run/utilities/logger";
import { Command } from "commander";
import { env } from "../config";

const logger = getLogger("debug");

export function registerDebugCommands(program: Command) {
  program
    .command("debug:seed")
    .description("Seed the database with test data, for development")
    .action(
      actionWithErrorHandler(() => {
        seed();
      }),
    );
}

export async function seed() {
  const db = await Database.connect(env.DB_FILE_PATH);

  logger.info(`Seeding database at path: ${db.filePath}`);
  await db.purge();
  await db.addProxy({
    name: "Claude proxy",
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
    name: "Inspector proxy",
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
    name: "Cursor proxy",
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

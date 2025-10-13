import { TRPCClientError } from "@trpc/client";
import chalk from "chalk";
import Table from "cli-table3";
import { getLogger } from "../logger";

const logger = getLogger("cli");

export function actionWithErrorHandler<Args extends unknown[]>(
  handler: (...args: Args) => void | Promise<void>,
): (...args: Args) => Promise<void> {
  return async (...args: Args) => {
    try {
      await handler(...args);
    } catch (error) {
      if (error instanceof TRPCClientError) {
        logger.error({ message: `TRPCClientError ${error.message}` });
      } else if (error instanceof Error) {
        logger.error({ error, message: `${error.message}` });
      } else {
        logger.error({ error, message: "Unexpected error" });
      }
    }
  };
}

export function makeTable(head: string[]) {
  return new Table({
    head,
    style: {
      head: ["blue", "bold"],
      border: [],
      compact: true,
    },
    chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
  });
}

export function attributeTable(
  attributes: Record<string, string | boolean | number | string[]>,
) {
  const table = new Table({
    style: {
      head: ["blue", "bold"],
      border: [],
      compact: true,
    },
    chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
  });
  for (const [key, value] of Object.entries(attributes)) {
    table.push([chalk.blue(key), value.toString()]);
  }
  return table.toString();
}

export function printDirectorAscii(): void {
  console.log(`
         _ _               _             
        | (_)             | |            
      __| |_ _ __ ___  ___| |_ ___  _ __ 
     / _' | | '__/ _ \\/ __| __/ _ \\| '__|
    | (_| | | | |  __/ (__| || (_) | |   
     \\__,_|_|_|  \\___|\\___|\\__\\___/|_|   
                                         
                                         `);
}

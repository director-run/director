import { TRPCClientError } from "@trpc/client";
import Table from "cli-table3";
import { Option } from "commander";
import { getLogger } from "./logger";

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
        logger.error("Unexpected error:", error);
      }
    }
  };
}

export function mandatoryOption(flags: string, description?: string) {
  const option = new Option(flags, description);
  option.makeOptionMandatory(true);
  return option;
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

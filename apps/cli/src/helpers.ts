import Table from "cli-table3";
import { Option } from "commander";

export function withErrorHandler<Args extends unknown[]>(
  handler: (...args: Args) => void | Promise<void>,
): (...args: Args) => Promise<void> {
  return async (...args: Args) => {
    try {
      await handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error("Error: An unexpected error occurred");
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

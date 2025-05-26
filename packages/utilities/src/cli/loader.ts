import _ from "lodash";
import ora from "ora";
import { blue } from "./colors";

export const loader = (text?: string) =>
  ora({
    text: text ?? _.sample(loaderStrings),
    spinner: {
      frames: ["   ", blue(">  "), blue(">> "), blue(">>>")],
    },
  });

/**
 * Wraps an async function with a spinner, allowing chainable start and success messages.
 * Usage:
 *   await spinnerWrap(() => myAsyncFn()).startMessage('...').successMessage('...').run();
 */
export function spinnerWrap<T>(fn: () => Promise<T>) {
  let startMsg = "Working...";
  let successMsg: string | undefined;
  return {
    start(msg: string) {
      startMsg = msg;
      return this;
    },
    succeed(msg: string) {
      successMsg = msg;
      return this;
    },
    async run() {
      const spinner = loader();
      spinner.start(startMsg);
      try {
        const result = await fn();
        if (successMsg) {
          spinner.succeed(successMsg);
        } else {
          spinner.stop();
        }
        return result;
      } catch (error) {
        spinner.fail(error instanceof Error ? error.message : "unknown error");
        throw error;
      }
    },
  };
}

const loaderStrings = [
  "Hang on...",
  "Sit tight...",
  "Just a sec...",
  "Brewing some magic...",
  "Dusting pixels...",
  "Loading unicorns...",
  "Spinning the hamster wheel...",
  "Counting to infinity...",
  "Sharpening crayons...",
  "Training AI hamsters...",
  "Waking up the elves...",
  "Charging flux capacitor...",
  "Polishing the bits...",
  "Assembling Lego bricks...",
  "Mixing secret sauce...",
  "Feeding the loading monster...",
  "Convincing electrons...",
  "Summoning digital wizards...",
  "Reticulating splines...",
  "Inflating balloons...",
  "Taming wild data...",
  "Cooking your request...",
  "Adjusting reality...",
  "Aligning planets...",
  "Unpacking virtual boxes...",
  "Fueling rocket boosters...",
  "Rounding up bytes...",
  "Stretching pixels...",
  "Firing lasers...",
  "Dancing with servers...",
  "Tuning frequencies...",
  "Hunting for lost bits...",
  "Fluffing clouds...",
  "Drawing pretty circles...",
  "Building sandcastles...",
  "Tickling the circuits...",
  "Tightening screws...",
  "Magic happening...",
  "Making it awesome...",
  "Catching fireflies...",
];

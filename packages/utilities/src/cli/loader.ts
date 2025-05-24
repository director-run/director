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

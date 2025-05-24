import { blue } from "./colors";
import ora from "ora";

export const loader = (text: string) =>
    ora({
      text,
      spinner: {
        frames: ["   ", blue(">  "), blue(">> "), blue(">>>")],
      },
    }); 
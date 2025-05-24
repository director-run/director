import { blue } from "./colors";
import ora from "ora";

export const loader = (text?: string) =>
    ora({
      text: text ?? "Hang on...",
      spinner: {
        frames: ["   ", blue(">  "), blue(">> "), blue(">>>")],
      },
    }); 



    const loaderStrings = [
        "Hang on...",
        "Just a moment...",
        "Almost there...",
        "One last thing...",
        "One last thing...",
        "Sit tight...",
        "Almost done...",
        "Just a sec...",
        "One sec...",
        "One sec...",
    ]
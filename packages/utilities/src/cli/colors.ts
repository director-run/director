import chalk from "chalk";
import picocolors from "picocolors";
export const blue = hex("#0099F7");
export const red = hex("#F11712");
export const green = hex("#00FF00");
export const yellow = (text: string) => chalk.yellow(text);

function hex(color: string): (text: string) => string {
  const ansiColor = hexToAnsi256(color);
  return (text: string) =>
    `\x1b[38;5;${ansiColor}m${text}${picocolors.reset("")}`;
}

function hexToAnsi256(sHex: string): number {
  const rgb = parseInt(sHex.slice(1), 16);
  const r = Math.floor(rgb / (256 * 256)) % 256;
  const g = Math.floor(rgb / 256) % 256;
  const b = rgb % 256;

  const ansi =
    16 +
    36 * Math.round((r / 255) * 5) +
    6 * Math.round((g / 255) * 5) +
    Math.round((b / 255) * 5);
  return ansi;
}

export function whiteBold(text: string) {
  return chalk.white.bold(text);
}

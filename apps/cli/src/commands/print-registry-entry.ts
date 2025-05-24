import type { EntryGetParams } from "@director.run/registry/db/schema";
import chalk from "chalk";

export function printReistryEntry(entry: EntryGetParams) {
  console.log(`
${chalk.white.bold(entry.name.toUpperCase())}
${entry.description}

${chalk.white.underline("homepage:")} ${makeClickableUrl(entry.homepage)} 
${chalk.white.underline("created:")} ${entry.createdAt?.toLocaleString()}
${chalk.white.underline("official:")} ${entry.isOfficial ? "yes" : "no"}


${chalk.white.bold("TRANSPORT")}
${JSON.stringify(entry.transport, null, 2)}


${chalk.white.bold("PARAMETERS")}
${JSON.stringify(entry.parameters, null, 2)}


${chalk.white.bold("README")}
${entry.readme}
    `);
}

const makeClickableUrl = (url: string) => {
  // OSC 8 hyperlink format: \x1b]8;;URL\x1b\\TEXT\x1b]8;;\x1b\\
  return `\x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`;
};

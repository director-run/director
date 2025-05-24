import type { EntryGetParams } from "@director.run/registry/db/schema";
import chalk from "chalk";

export function printRegistryEntry(entry: EntryGetParams) {
  console.log(`
${chalk.white.bold(entry.name.toUpperCase())}
${entry.description}

${chalk.white.underline("homepage:")} ${makeClickableUrl(entry.homepage)} 
${chalk.white.underline("created:")} ${entry.createdAt?.toLocaleString()}
${chalk.white.underline("official:")} ${entry.isOfficial ? "yes" : "no"}
${chalk.white.underline("readme:")} ${entry.readme ? "yes" : "no"}
${chalk.white.underline("enriched:")} ${entry.isEnriched ? "yes" : "no"}


${chalk.white.bold("TRANSPORT")}
${JSON.stringify(entry.transport, null, 2)}


${chalk.white.bold("PARAMETERS")}
${JSON.stringify(entry.parameters, null, 2)}

${printTool(entry)}
`);
}

const printTool = (entry: EntryGetParams) => {
  if (!entry.tools) {
    return "";
  } else {
    const lines = [];
    lines.push(chalk.white.bold("TOOLS"));

    entry.tools.forEach((tool) => {
      lines.push("");
      lines.push(chalk.white.bold(tool.name));
      lines.push(tool.description);
      // lines.push(JSON.stringify(tool.inputSchema, null, 2));
    });
    return lines.join("\n");
  }
};

const makeClickableUrl = (url: string) => {
  // OSC 8 hyperlink format: \x1b]8;;URL\x1b\\TEXT\x1b]8;;\x1b\\
  return `\x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`;
};

export const printReadme = (entry: EntryGetParams) => {
  console.log(entry.readme);
};

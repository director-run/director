import { type EntryGetParams } from "../db/schema";

type Parameter = {
  name: string;
  description: string;
  required: boolean;
  scope: "env" | "args";
};

export function parseParameters(entry: EntryGetParams) {
  const parameters: Array<Parameter> = [];
  if (entry.transport.type === "stdio") {
    parameters.push(...parseArgumentParameters(entry.transport.args));
  }
  return parameters;
}

function parseArgumentParameters(args: string[]) {
  const parameters: Array<Parameter> = [];

  for (const arg of args) {
    parameters.push(
      ...extractUppercaseWithUnderscores(arg).map((name) => ({
        name,
        description: "",
        required: true,
        scope: "args" as const,
      })),
    );
  }
  return parameters;
}

/**
 * Extracts all substrings containing only uppercase letters and underscores from a string
 * @param input The input string to search through
 * @returns An array of extracted uppercase-only substrings
 */
function extractUppercaseWithUnderscores(input: string): string[] {
  // Use regular expression to find all matches of uppercase letters and underscores
  const matches = input.match(/[A-Z_]+/g);

  // Return matches if found, otherwise return empty array
  return matches ? matches.filter((match) => /^[A-Z_]+$/.test(match)) : [];
}

// Example usage:
// const text = "Here is MY_API_KEY and another CONSTANT_VALUE with some other text";
// const extracted = extractUppercaseWithUnderscores(text);
// Result: ["MY_API_KEY", "CONSTANT_VALUE"]

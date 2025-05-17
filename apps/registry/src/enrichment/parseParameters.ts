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
    // TODO: parse env parameters
    // parameters.push(...parseEnvParameters(entry.transport.env ?? {}));
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

function parseEnvParameters(env: Record<string, string>) {
  const parameters: Array<Parameter> = [];

  for (const [key, value] of Object.entries(env)) {
    parameters.push({
      name: key,
      description: value,
      required: true,
      scope: "env" as const,
    });
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
  // Filter for matches that are uppercase+underscore only and longer than 3 chars

  const filtered = matches
    ?.filter((match) => /^[A-Z_]+$/.test(match))
    .filter((match) => match.length > 3);

  return filtered ?? [];
}

// Example usage:
// const text = "Here is MY_API_KEY and another CONSTANT_VALUE with some other text";
// const extracted = extractUppercaseWithUnderscores(text);
// Result: ["MY_API_KEY", "CONSTANT_VALUE"]

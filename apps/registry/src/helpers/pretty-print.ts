import chalk from "chalk";

export function prettyPrint<T extends Record<string, unknown>>(
  obj: T,
  options: {
    indentSize?: number;
    padding?: number;
    colorize?: boolean;
  } = {},
): string {
  const { indentSize = 4, padding = 1, colorize = true } = options;

  const indentStr = " ".repeat(indentSize);
  const paddingStr = "\n".repeat(padding);

  function formatValue(value: unknown, level: number): string {
    const currentIndent = indentStr.repeat(level);
    const nextIndent = indentStr.repeat(level + 1);

    if (value === null) {
      return "null";
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "[]";
      }
      return `[\n${value
        .map((item) => `${nextIndent}${formatValue(item, level + 1)}`)
        .join(",\n")}\n${currentIndent}]`;
    }

    if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) {
        return "{}";
      }
      return `{\n${entries
        .map(([key, val]) => {
          const formattedKey = colorize ? chalk.blue(key) : key;
          return `${nextIndent}${formattedKey}: ${formatValue(val, level + 1)}`;
        })
        .join(",\n")}\n${currentIndent}}`;
    }

    return JSON.stringify(value);
  }

  return `${paddingStr}${formatValue(obj, 0)}${paddingStr}`;
}

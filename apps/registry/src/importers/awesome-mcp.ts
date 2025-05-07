// Map emojis → labels
const iconMap: Record<string, string> = {
  "🎖️": "official implementation",
  "🐍": "Python codebase",
  "📇": "TypeScript codebase",
  "🏎️": "Go codebase",
  "🦀": "Rust codebase",
  "#️⃣": "C# codebase",
  "☕": "Java codebase",
  "☁️": "Cloud Service",
  "🏠": "Local Service",
  "📟": "Embedded Systems",
  "🍎": "macOS",
  "🪟": "Windows",
  "🐧": "Linux",
};

export interface Server {
  name: string;
  url: string;
  description: string;
  category: string;
  attributes: string[];
}

export async function fetchAwesomeMCPEntries(): Promise<Server[]> {
  const rawUrl =
    "https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md";
  const res = await fetch(rawUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch README.md: ${res.statusText}`);
  }
  const lines = (await res.text()).split("\n");

  const servers: Server[] = [];
  let currentCategory = "";

  for (const line of lines) {
    // a) Category header?
    const catMatch = line.match(/^###\s+(.+)$/);
    if (catMatch) {
      // strip HTML tags
      const noHtml = catMatch[1].replace(/<\/?[^>]+>/g, "");
      // strip leading emojis & whitespace
      currentCategory = noHtml
        .replace(/^[\p{Emoji_Presentation}\p{Emoji}\s]+/u, "")
        .trim();
      continue;
    }

    // b) Server entry?
    const srvMatch = line.match(
      /^-\s+\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\s*(.*?)\s*-\s*(.+)$/,
    );
    if (!srvMatch) {
      continue;
    }

    const [, name, url, iconStr, description] = srvMatch;
    const attributes = iconStr
      .split(/\s+/)
      .filter((ic) => !!ic)
      .map((ic) => iconMap[ic] || ic);

    servers.push({
      name,
      url,
      description,
      category: currentCategory,
      attributes,
    });
  }

  return servers;
}

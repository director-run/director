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

// Map runtime indicators to actual runtime names
const runtimeMap: Record<string, string> = {
  "🐍": "Python",
  "📇": "TypeScript",
  "🏎️": "Go",
  "🦀": "Rust",
  "#️⃣": "C#",
  "☕": "Java",
};

export interface Server {
  name: string;
  url: string;
  description: string;
  category: string;
  attributes: string[];
  runtime?: string | null;
  provider?: string | null;
  license?: string | null;
  tools: Array<{
    name: string;
    description: string;
    arguments?: string[];
    inputs?: Array<{
      name: string;
      type: string;
      required?: boolean;
      description?: string;
    }>;
  }>;
  parameters: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
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

    // Extract runtime from attributes
    const runtime =
      attributes.map((attr) => runtimeMap[attr]).find((r) => r !== undefined) ||
      null;

    // Extract provider from URL
    const provider = new URL(url).hostname.split(".").slice(-2).join(".");

    // Create basic tools and parameters based on attributes
    const tools = attributes.map((attr) => ({
      name: attr,
      description: `Tool for ${attr}`,
    }));

    const parameters = attributes.map((attr) => ({
      name: attr.toLowerCase().replace(/\s+/g, "_"),
      description: `Parameter for ${attr}`,
      required: false,
    }));

    servers.push({
      name,
      url,
      description,
      category: currentCategory,
      attributes,
      runtime,
      provider,
      license: null, // We don't know the license from the README
      tools,
      parameters,
    });
  }

  return servers;
}

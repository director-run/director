import { join } from "path";
import { writeFile } from "fs/promises";
import { z } from "zod";
import { DATA_DIR, REGISTRY_URL } from "../config";
import { readJSONFile } from "../helpers/json";

export const ServerSchema = z.object({
  name: z.string(),
  description: z.string(),
  sourceUrl: z.string(),
  config: z.object({
    mcpKey: z.string(),
    runtime: z.string(),
    args: z.array(z.string()),
  }),
  features: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      prompt: z.string(),
    }),
  ),
  setup: z.array(z.never()),
});

export type Server = z.infer<typeof ServerSchema>;

const REGISTRY_FILE = join(DATA_DIR, "servers.json");

export async function fetchRegistry(): Promise<void> {
  const response = await fetch(REGISTRY_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.statusText}`);
  }
  const data = await response.json();
  await writeFile(REGISTRY_FILE, JSON.stringify(data, null, 2));
}

export async function getServers(): Promise<Server[]> {
  const data = await readJSONFile<Server[]>(REGISTRY_FILE);
  return data;
  // return data.map((server: unknown) => ServerSchema.parse(server));
}

export async function getServer(name: string): Promise<Server | undefined> {
  const servers = await getServers();
  return servers.find((server) => server.name === name);
}

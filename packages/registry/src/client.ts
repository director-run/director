import { z } from "zod";

const REGISTRY_URL =
  "https://gist.githubusercontent.com/barnaby/f8a47505aa8931317cf3010d680506b4/raw/958a4ad714a3810d3575747fb3714e33f363c631/registry.json";

export const RegistryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  transport: z.object({
    type: z.literal("stdio"),
    command: z.string(),
    args: z.array(z.string()),
  }),
  source: z.object({
    type: z.literal("github"),
    url: z.string(),
  }),
  sourceRegistry: z.object({
    name: z.string(),
  }),
  categories: z.array(z.string()),
});

export type RegistryEntry = z.infer<typeof RegistryEntrySchema>;

export const RegistrySchema = z.object({
  entries: z.array(RegistryEntrySchema),
  lastUpdatedAt: z.string().datetime(),
});

export type Registry = z.infer<typeof RegistrySchema>;

export async function fetchRegistry(): Promise<Registry> {
  const response = await fetch(REGISTRY_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.statusText}`);
  }
  const data = await response.json();
  return RegistrySchema.parse(data);
}

export async function fetchEntries(): Promise<RegistryEntry[]> {
  const data = await fetchRegistry();
  return data.entries;
}

export async function fetchEntry(
  id: string,
): Promise<RegistryEntry | undefined> {
  const servers = await fetchEntries();
  return servers.find((server) => server.id === id);
}

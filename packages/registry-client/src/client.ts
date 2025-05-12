import { z } from "zod";

const REGISTRY_URL = "http://localhost:3000/api/v1/entries";

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

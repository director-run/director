import { z } from "zod";

const REGISTRY_URL = "http://localhost:3000/api/v1/entries";

const RegistryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  createdAt: z.date(),
  isOfficial: z.boolean(),
  transport: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("stdio"),
      command: z.string(),
      args: z.array(z.string()),
      env: z.record(z.string()).optional(),
    }),
    z.object({
      type: z.literal("sse"),
      url: z.string(),
    }),
  ]),
  homepage: z.string().optional(),
  source_registry: z
    .object({
      name: z.string(),
      entryId: z.string(),
    })
    .optional(),
  categories: z.array(z.string()),
  tools: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        arguments: z.array(z.string()).optional(),
        inputs: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              required: z.boolean().optional(),
              description: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
  parameters: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        required: z.boolean().optional(),
      }),
    )
    .optional(),
  readme: z.string().optional(),
});

export type RegistryEntry = z.infer<typeof RegistryEntrySchema>;

const RegistrySchema = z.object({
  data: z.array(RegistryEntrySchema),
  // lastUpdatedAt: z.string().datetime(),
});

export type Registry = z.infer<typeof RegistrySchema>;

export async function fetchRegistry(): Promise<Registry> {
  const response = await fetch(REGISTRY_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
  // return RegistrySchema.parse(data);
  return data;
}

export async function fetchEntries(): Promise<RegistryEntry[]> {
  const data = await fetchRegistry();
  return data.data;
}

export async function fetchEntry(
  name: string,
): Promise<RegistryEntry | undefined> {
  const servers = await fetchEntries();
  return servers.find((server) => server.name === name);
}

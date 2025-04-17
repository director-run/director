import { z } from "zod";
import { REGISTRY_URL } from "../../config";

export const RegistryItemSchema = z.object({
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

export type RegistryItem = z.infer<typeof RegistryItemSchema>;

export async function fetchRegistry(): Promise<Array<RegistryItem>> {
  const response = await fetch(REGISTRY_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
  //   return data.map((server: unknown) => RegistryItemSchema.parse(server));
}

export async function getServers(): Promise<RegistryItem[]> {
  const data = await fetchRegistry();
  return data;
  // return data.map((server: unknown) => ServerSchema.parse(server));
}

export async function getServer(
  name: string,
): Promise<RegistryItem | undefined> {
  const servers = await getServers();
  return servers.find((server) => server.name === name);
}

import { createRegistryClient } from "@director.run/registry/client";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";

export function createRegistryRouter({ registryURL }: { registryURL: string }) {
  const registryClient = createRegistryClient(registryURL);
  return t.router({
    getEntries: t.procedure
      .input(
        z.object({
          pageIndex: z.number().min(0),
          pageSize: z.number().min(1),
        }),
      )
      .query(({ input }) => registryClient.entries.getEntries.query(input)),
    getEntryByName: t.procedure
      .input(z.object({ name: z.string() }))
      .query(({ input }) => registryClient.entries.getEntryByName.query(input)),
  });
}

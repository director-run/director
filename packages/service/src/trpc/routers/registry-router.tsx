import { AppError, ErrorCode } from "@director.run/utilities/error";
import { z } from "zod";

import { fetchEntries, fetchEntry } from "@director.run/registry-client/client";
import { t } from "../server";

export function createRegistryRouter() {
  return t.router({
    list: t.procedure.query(async () => {
      const entries = await fetchEntries();
      return entries;
    }),
    get: t.procedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const entry = await fetchEntry(input.id);
        if (!entry) {
          throw new AppError(
            ErrorCode.NOT_FOUND,
            `registry entry ${input.id} not found`,
          );
        }
        return entry;
      }),
  });
}

import { z } from "zod";
import { ErrorCode } from "../../../helpers/error";
import { AppError } from "../../../helpers/error";
import { fetchEntries, fetchEntry } from "../../../services/registry";
import { createTRPCRouter, loggedProcedure } from "./middleware";

export function createRegistryRouter() {
  return createTRPCRouter({
    list: loggedProcedure.query(async () => {
      const entries = await fetchEntries();
      return entries;
    }),
    get: loggedProcedure
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

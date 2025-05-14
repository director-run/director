import { t } from "@director.run/utilities/trpc";
import { getAllEntries } from "../../db/entries";

export function createEntriesRouter() {
  return t.router({
    getEntries: t.procedure.query(async () => {
      const entries = await getAllEntries();
      return entries;
    }),
  });
}

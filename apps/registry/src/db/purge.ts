import { db } from "./index";
import { entriesTable } from "./schema";

export async function purgeDatabase() {
  await db.delete(entriesTable);
  console.log("Successfully purged database");
}

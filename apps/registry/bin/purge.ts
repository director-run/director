import { db } from "../src/db";
import { entriesTable } from "../src/db/schema";

await db.delete(entriesTable);

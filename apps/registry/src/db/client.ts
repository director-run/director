import { isProduction } from "@director.run/utilities/env";
import { drizzle as NeonDrizzle } from "drizzle-orm/neon-http";
import { drizzle as LocalDrizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

function getDb() {
  if (
    isProduction() &&
    typeof process.env.DATABASE_URL === "string" &&
    process.env.DATABASE_URL.includes("neon")
  ) {
    return NeonDrizzle(process.env.DATABASE_URL, { schema });
  } else {
    return LocalDrizzle(process.env.DATABASE_URL as string, { schema });
  }
}

export const db = getDb();

export type DatabaseConnection = typeof db;

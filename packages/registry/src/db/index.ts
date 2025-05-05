import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:travel-china-spend-nothing@localhost:5432/director-registry",
});

export const db = drizzle(pool, { schema });

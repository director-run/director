import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/config";
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});

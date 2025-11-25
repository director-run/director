import { defineConfig } from "drizzle-kit";

// Note: We read DATABASE_URL directly from process.env here instead of
// importing from ./src/env to avoid issues with drizzle-kit's config loader.
// The env.ts file has side effects (dotenv loading, validation) that can
// cause problems when drizzle-kit transpiles and runs this config.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

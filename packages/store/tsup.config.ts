import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/**/*.{ts,tsx}"],
  format: ["cjs", "esm"],
  minify: true,
  dts: true,
  treeshake: "recommended",
  sourcemap: true,
  clean: true,
  external: ["zod"],
  ...options,
}));

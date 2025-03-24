import { defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig((options) => ({
  entry: ["src/**/*.{ts,tsx}"],
  format: ["cjs", "esm"],
  minify: true,
  dts: true,
  treeshake: "recommended",
  sourcemap: true,
  clean: isProduction,
  external: ["react", "react-dom", "@phosphor-icons/react"],
  ...options,
}));

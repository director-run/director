import { Options, defineConfig } from "tsup";

const isProduction = process.env.NODE_ENV === "production";

export const options: Options[] = [
  {
    entry: ["src/**/*.{ts,tsx}"],
    format: ["cjs", "esm"],
    minify: true,
    dts: true,
    treeshake: "recommended",
    sourcemap: true,
    clean: isProduction,
    external: ["react", "react-dom"],
  },
];

export default defineConfig(options);

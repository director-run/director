import { Options, defineConfig } from "tsup";

export const options: Options[] = [
  {
    entry: ["src/**/!(*.test).{ts,tsx}"],
    format: ["esm"],
    minify: true,
    dts: true,
    treeshake: "recommended",
    sourcemap: true,
    clean: true,
    outDir: "dist",
  },
];

export default defineConfig(options);

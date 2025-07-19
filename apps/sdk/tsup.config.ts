import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  bundle: true,
  external: [],
  noExternal: ["@director.run/gateway", "@director.run/registry"],
  splitting: false,
  sourcemap: true,
  clean: true,
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: {
    resolve: true,
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@director.run/gateway/*": ["../../packages/gateway/src/*"],
        "@director.run/registry/*": ["../../apps/registry/src/*"],
      },
    },
  },
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: true,
  treeshake: true,
  noExternal: [/.*/],
});

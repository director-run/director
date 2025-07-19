import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: {
    resolve: true,
    compilerOptions: {
      // See: https://github.com/egoist/tsup/issues/571#issuecomment-2457920686
      composite: false,
      paths: {
        "@director.run/gateway/*": ["../../packages/gateway/src/*"],
        "@director.run/registry/*": ["../../packages/registry/src/*"],
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

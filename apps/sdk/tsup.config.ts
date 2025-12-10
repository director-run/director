import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: {
    resolve: true,
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@director.run/gateway/*": ["../../apps/gateway/src/*"],
        "@director.run/mcp/*": ["../../packages/mcp/src/*"],
        "@director.run/utilities/*": ["../../packages/utilities/src/*"],
        "@director.run/client-configurator/*": [
          "../../packages/client-configurator/src/*",
        ],
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
  external: ["@trpc/server", "@trpc/client", "trpc", "zod"],
});

#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { env } from "../src/config";
import { Registry } from "../src/registry";

const registry = Registry.start({
  port: env.PORT,
  connectionString: env.DATABASE_URL,
});

// biome-ignore lint/style/noDefaultExport: required for vercel functions
export default registry.app;

import { env } from "../src/config";
import { Registry } from "../src/registry";

const registry = Registry.start({
  port: env.PORT,
  connectionString: env.DATABASE_URL,
});

module.exports = registry.app;

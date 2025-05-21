import { Registry } from "../src/registry";

const registry = Registry.start({ port: 3000 });
module.exports = registry.app;

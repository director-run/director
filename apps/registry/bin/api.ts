import { env } from "../src/config";
import { Registry } from "../src/registry";

await Registry.start({ port: env.REGISTRY_PORT });

import { ClientStore } from "@director.run/client-configurator/client-store";
import { env } from "./env";

export const clientStore = new ClientStore({
  configKeyPrefix: env.CLIENT_KEY_PREFIX,
});

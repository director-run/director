import { allClientStatuses } from "@director.run/client-configurator/index";
import { isCommandInPath } from "@director.run/utilities/os";

export async function getStatus() {
  return {
    platform: process.platform,
    dependencies: {
      npx: {
        installed: isCommandInPath("npx"),
      },
      uvx: {
        installed: isCommandInPath("uvx"),
      },
    },
    clients: await allClientStatuses(),
  };
}

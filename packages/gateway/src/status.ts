import { allClientStatuses } from "@director.run/client-configurator/index";

export async function getStatus() {
  return {
    platform: process.platform,
    dependencies: {
      //   os: process.versions.os,
      //   node: process.versions.node,
      //   npm: process.versions.npm,
    },
    clients: await allClientStatuses(),
  };
}

import { $ } from "zx";
import type { VM, VMState } from "../types";

export async function list(): Promise<VM[]> {
  const ls = await $`tart list`;
  const vms = parseTartOutput(ls.stdout);

  const vmsWithIP = await Promise.all(
    vms.map(async (vm) => ({
      ...vm,
      ip: vm.state === "running" ? await getIP(vm.name) : undefined,
    })),
  );

  return vmsWithIP;
}

async function getIP(name: string): Promise<string> {
  return (await $`tart ip ${name}`).stdout.trim();
}

function parseTartOutput(output: string): VM[] {
  const lines = output.trim().split("\n");

  // Skip the header line and process data lines
  const dataLines = lines.slice(1);

  const vms = dataLines
    .map((line) => {
      // Split by whitespace, but handle the case where Source Name might have spaces
      const parts = line.trim().split(/\s+/);

      // The last 4 parts are always: Disk Size, SizeOnDisk, State, Status
      const sizeOnDisk = parts[parts.length - 2];
      const state = parts[parts.length - 1] as VMState;
      const size = parts[parts.length - 3];
      const diskSize = parts[parts.length - 4];

      // Everything before the last 4 parts is the source name
      const source = parts[0];
      const name = parts.slice(1, parts.length - 4).join(" ");

      if (source !== "local") {
        // omit OCI images from the list
        return undefined;
      }

      return {
        source,
        name,
        state,
      };
    })
    .filter((vm) => !!vm);

  return vms;
}

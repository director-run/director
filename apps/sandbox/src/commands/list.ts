import { $ } from "zx";
import type { VM, VMState } from "../types";

export async function list() {
  console.log(`listing`);
  const ls = await $`tart list`;
  const vms = parseTartOutput(ls.stdout);
  return vms;
}

function parseTartOutput(output: string): VM[] {
  const lines = output.trim().split("\n");

  // Skip the header line and process data lines
  const dataLines = lines.slice(1);

  const vms = dataLines.map((line) => {
    // Split by whitespace, but handle the case where Source Name might have spaces
    const parts = line.trim().split(/\s+/);

    // The last 4 parts are always: Disk Size, SizeOnDisk, State, Status
    const sizeOnDisk = parts[parts.length - 2];
    const state = parts[parts.length - 1];
    const size = parts[parts.length - 3];
    const diskSize = parts[parts.length - 4];

    // Everything before the last 4 parts is the source name
    const source = parts[0];
    const name = parts.slice(1, parts.length - 4).join(" ");

    return {
      source,
      name,
      state: state as VMState,
    };
  });

  return vms;
}

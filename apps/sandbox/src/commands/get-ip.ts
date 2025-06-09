import { $ } from "zx";
import { list } from "./list";

export async function getIP(name: string): Promise<string> {
  return (await $`tart ip ${name}`).stdout.trim();
}

export async function get(name: string) {
  const vms = await list();
  const vm = vms.find((vm) => vm.name === name);
  return vm;
}

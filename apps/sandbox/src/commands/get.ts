import { list } from "./list";

export async function get(name: string) {
  const vms = await list();
  const vm = vms.find((vm) => vm.name === name);
  return vm;
}

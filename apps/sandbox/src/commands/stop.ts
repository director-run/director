import { $ } from "zx";

export async function stop(name: string) {
  console.log(`stopping ${name}`);
  await $`tart stop ${name}`;
}

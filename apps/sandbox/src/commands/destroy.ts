import { $ } from "zx";

export async function destroy(name: string) {
  console.log(`destroying ${name}`);

  try {
    await $`tart stop ${name}`;
  } catch (e) {
    console.log(`${name} is not running, skipping stop`);
  }
  await $`tart delete ${name}`;
}

import { $ } from "zx";

export async function start(name: string) {
  console.log(`starting ${name}`);
  const run = await $`nohup tart run ${name} --no-graphics &`;
  return run;
}

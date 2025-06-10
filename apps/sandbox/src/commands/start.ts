import { $ } from "zx";

export async function start(name: string, options: { mount?: string } = {}) {
  console.log(`starting ${name}`);
  const run =
    await $`nohup tart run ${name} --no-graphics --dir=director:/Users/barnaby/Projects/director &`;
  return run;
}

import { $ } from "zx";

export async function start(name: string, options: { mount?: string } = {}) {
  console.log(`starting ${name}`);
  const mountArg = options.mount ? `--dir=${options.mount}` : "";
  const run = await $`nohup tart run ${name} --no-graphics ${mountArg} &`;
  return run;
}

import { ssh as webpodSsh } from "webpod";
import { $, echo } from "zx";

type VMState = "stopped" | "running";

type VM = {
  name: string;
  state: VMState;
};

export async function getIP(name: string): Promise<string> {
  return (await $`tart ip ${name}`).stdout.trim();
}

export async function trust(name: string) {
  const ip = await getIP(name);
  console.log(`trusting ${name} ${ip}`);
  echo(
    await $`ssh-keygen -R ${ip} && ssh-keyscan -H ${ip} >> ~/.ssh/known_hosts`,
  );
}

export async function copyId(
  name: string,
  user: string = "admin",
  password: string = "admin",
) {
  const ip = await getIP(name);
  console.log(`copying id to ${name} ${ip}`);
  echo(await $`sshpass -p "${password}" ssh-copy-id ${user}@${ip}`);
}

export async function list() {
  console.log(`listing`);
  const ls = await $`tart list`;
  const vms = parseTartOutput(ls.stdout);
  return vms;
}

export async function get(name: string) {
  const vms = await list();
  const vm = vms.find((vm) => vm.name === name);
  return vm;
}

export async function destroy(name: string) {
  console.log(`destroying ${name}`);

  try {
    await $`tart stop ${name}`;
  } catch (e) {
    console.log(`${name} is not running, skipping stop`);
  }
  await $`tart delete ${name}`;
}

export async function start(name: string) {
  console.log(`starting ${name}`);
  const run = await $`nohup tart run ${name} --no-graphics &`;
  return run;
}

export async function create(
  name: string,
  image: string = "ghcr.io/cirruslabs/ubuntu:latest",
): Promise<VM | undefined> {
  console.log(`creating ${name}`);
  echo(await $`tart clone ${image} ${name}`);
  return get(name);
}

export async function stop(name: string) {
  console.log(`stopping ${name}`);
  await $`tart stop ${name}`;
}

export async function provision(name: string) {
  console.log(`provisioning ${name}`);
  // TODO: add --ask-pass to set the password
  const cmd = $`ansible-playbook -i "$(tart ip ${name})," -u admin ansible/playbook.yml -e "hostname=${name}"`;

  for await (const chunk of cmd.stdout) {
    echo(chunk);
  }
}

export async function run(name: string) {
  await $`nohup tart run ${name} --no-graphics &`;
}

export async function ssh(name: string) {
  const ip = await getIP(name);
  console.log(`ssh to ${name} ${ip}`);
  webpodSsh({
    // host: ip,
    remoteUser: "admin",
    hostname: ip,
  });
}

export function parseTartOutput(output: string): VM[] {
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

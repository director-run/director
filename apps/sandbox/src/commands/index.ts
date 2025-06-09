import { $, echo } from "zx";

export async function destroy(name: string) {
  console.log(`destroying ${name}`);

  try {
    await $`tart stop ${name}`;
  } catch (e) {
    console.log(`${name} is not running, skipping stop`);
  }
  await $`tart delete ${name}`;
}

export async function stop(name: string) {
  console.log(`stopping ${name}`);
  await $`tart stop ${name}`;
}

export async function provision(name: string) {
  console.log(`provisioning ${name}`);
  // TODO: set the password here, not in the vars.yml file
  const cmd = $`ansible-playbook -i "$(tart ip ${name})," -u admin ansible/playbook.yml  -e "hostname=${name}" --ssh-extra-args="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"`;

  for await (const chunk of cmd.stdout) {
    echo(chunk);
  }
}

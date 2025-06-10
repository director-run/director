import { $, echo } from "zx";

export async function provision(params: {
  name: string;
  password: string;
  user: string;
}) {
  const { name, password, user } = params;
  console.log(`provisioning ${name}`);
  const cmd = $`ansible-playbook \
      -i "$(tart ip ${name})," \
      -u ${user} \
      ansible/playbook.yml \
      -e "hostname=${name}" \
      -e "ansible_ssh_pass=${password}" \
      -e "user=${user}" \
      --ssh-extra-args="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"`;

  for await (const chunk of cmd.stdout) {
    echo(chunk);
  }
}

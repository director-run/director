import { $ } from "zx";

export async function ssh(params: {
  name: string;
  user: string;
  password: string;
}) {
  const { name, user, password } = params;
  try {
    await $({
      stdio: "inherit",
    })`sshpass -p ${password} ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${user}@$(tart ip ${name})`;
  } catch (error: unknown) {
    console.error(
      "Failed to connect:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

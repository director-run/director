import { $ } from "zx";

export async function ssh(
  name: string,
  user: string = "admin",
  password: string = "admin",
) {
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

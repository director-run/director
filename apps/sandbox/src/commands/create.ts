import { $, echo } from "zx";
import type { VM } from "../types";
import { get, getIP } from "./get-ip";

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

export async function create(
  name: string,
  image: string = "ghcr.io/cirruslabs/ubuntu:latest",
): Promise<VM | undefined> {
  console.log(`creating ${name}`);
  echo(await $`tart clone ${image} ${name}`);
  return get(name);
}

import { $, echo } from "zx";
import type { VM } from "../types";
import { get } from "./get";

export async function create(
  name: string,
  image: string = "ghcr.io/cirruslabs/ubuntu:latest",
): Promise<VM | undefined> {
  console.log(`creating ${name}`);
  echo(await $`tart clone ${image} ${name}`);
  return get(name);
}

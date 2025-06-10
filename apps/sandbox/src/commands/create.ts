import { $, echo } from "zx";
import type { VM } from "../types";
import { get } from "./get";

export async function create(params: {
  name: string;
  image: string;
}): Promise<VM | undefined> {
  const { name, image } = params;
  console.log(`creating ${name}`);
  echo(await $`tart clone ${image} ${name}`);
  return get(name);
}

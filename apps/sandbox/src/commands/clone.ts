import { $, echo } from "zx";
import type { VM } from "../types";
import { get } from "./get";

export async function clone(params: {
  src: string;
  dest: string;
}): Promise<VM | undefined> {
  const { src, dest } = params;
  console.log(`cloning ${src} to ${dest}`);
  echo(await $`tart clone ${src} ${dest}`);
  return get(dest);
}

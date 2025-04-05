import {
  promises as fs,
  type PathLike,
  type PathOrFileDescriptor,
  readFileSync,
} from "node:fs";
import type { FileHandle } from "node:fs/promises";
import type { JsonObject } from "type-fest";

const { readFile } = fs;

const parse = (buffer: Buffer<ArrayBufferLike>) => {
  let data = new TextDecoder().decode(buffer);
  return JSON.parse(data) as JsonObject;
};

export async function readJsonFile(filePath: PathLike | FileHandle) {
  const buffer = await readFile(filePath);
  return parse(buffer);
}

export function readJsonFileSync(filePath: PathOrFileDescriptor) {
  const buffer = readFileSync(filePath);
  return parse(buffer);
}

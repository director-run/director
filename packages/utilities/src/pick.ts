import type { DistributedPick, KeysOfUnion } from "type-fest";

type ArrayOf<T> = Array<T> | ReadonlyArray<T>;
export function pick<TObj extends object, TKey extends KeysOfUnion<TObj>>(
  obj: TObj,
  ...keys: ArrayOf<TKey> | [ArrayOf<TKey>]
): DistributedPick<TObj, TKey> {
  const actualKeys: string[] = Array.isArray(keys[0])
    ? (keys[0] as string[])
    : (keys as string[]);

  // biome-ignore lint/suspicious/noExplicitAny: ok
  const newObj: any = Object.create(null);
  for (const key in obj) {
    if (actualKeys.includes(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

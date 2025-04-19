export type DistributiveOmit<T, TKeys extends keyof T> = T extends unknown
  ? Omit<T, TKeys>
  : never;

/**
 * Extract all nullable keys from the given type.
 * (This was not provided by type-fest)
 */
export type NullableKeysOf<T extends object> = {
  [P in keyof T]-?: Extract<T[P], null | undefined> extends never ? never : P;
}[keyof T];

/**
 * Omit keys from an object.
 * @example
 * omit({foo: 'bar', baz: '1'}, 'baz'); // -> { foo: 'bar' }
 * omit({foo: 'bar', baz: '1'}, ['baz']); // -> { foo: 'bar' }
 * omit({foo: 'bar', baz: '1'}, 'foo', 'baz'); // -> {}
 * omit({foo: 'bar', baz: '1'}, ['foo', 'baz']); // -> {}
 */
export function omit<TObj extends object, TKey extends keyof TObj>(
  obj: TObj,
  ...keys: TKey[] | [TKey[]]
): DistributiveOmit<TObj, TKey> {
  const actualKeys: string[] = Array.isArray(keys[0])
    ? (keys[0] as string[])
    : (keys as string[]);

  // biome-ignore lint/suspicious/noExplicitAny: ok
  const newObj: any = Object.create(null);
  for (const key in obj) {
    if (!actualKeys.includes(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

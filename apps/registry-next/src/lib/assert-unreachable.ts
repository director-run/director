/**
 * @link https://stackoverflow.com/a/39419171
 */
export function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}

import { expect } from "vitest";
import { AppError, ErrorCode } from "./error";

export async function expectToThrowAppError(
  fn: () => Promise<unknown>,
  expected: {
    code: ErrorCode;
    props: Record<string, unknown>;
    message?: string;
  },
) {
  const error = await fn().catch((e) => e);
  expect(error).toBeInstanceOf(AppError);
  expect(error).toMatchObject(expected);
  if (expected.message) {
    expect((error as AppError).message).toBe(expected.message);
  }
}

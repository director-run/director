import { describe, expect, test } from "vitest";
import { DB_FILE_PATH } from "../config";
import { AppError, ErrorCode, isAppError } from "./error";

console.log(DB_FILE_PATH);

describe("errors", () => {
  describe("AppError", () => {
    test("should have the correct properties when thrown", () => {
      try {
        throw new AppError(ErrorCode.NOT_FOUND, "Could not find something", {
          foo: "bar",
        });
      } catch (error) {
        expect(isAppError(error)).toBe(true);
        const managedError = error as AppError;
        expect(managedError.name).toBe("AppError");
        expect(managedError.props).toEqual({ foo: "bar" });
        expect(managedError.code).toBe(ErrorCode.NOT_FOUND);
        expect(managedError.message).toBe("Could not find something");
      }
    });
  });

  describe("isManagedError", () => {
    test("returns true if the error is an instance of AppError", () => {
      try {
        throw new AppError(ErrorCode.NOT_FOUND, "Could not find something");
      } catch (error) {
        expect(isAppError(error)).toBe(true);
      }
    });
  });
});

import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { findFirstMatch } from "./fs";

describe("fs", () => {
  describe("findFirstMatch", () => {
    let tempDir: string;
    let testFiles: string[];

    beforeEach(() => {
      // Create a temporary directory for testing
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "director-test-"));
      testFiles = [];
    });

    afterEach(() => {
      // Clean up test files and directory
      for (const file of testFiles) {
        try {
          fs.unlinkSync(file);
        } catch {
          // Ignore errors during cleanup
        }
      }
      try {
        fs.rmdirSync(tempDir);
      } catch {
        // Ignore errors during cleanup
      }
    });

    test("should return the first file that exists", () => {
      const file1 = path.join(tempDir, "file1.txt");
      const file2 = path.join(tempDir, "file2.txt");
      const file3 = path.join(tempDir, "file3.txt");

      // Create only file2 and file3
      fs.writeFileSync(file2, "content2");
      fs.writeFileSync(file3, "content3");
      testFiles.push(file2, file3);

      const result = findFirstMatch([file1, file2, file3]);
      expect(result).toBe(file2);
    });

    test("should return undefined when no files exist", () => {
      const file1 = path.join(tempDir, "nonexistent1.txt");
      const file2 = path.join(tempDir, "nonexistent2.txt");

      const result = findFirstMatch([file1, file2]);
      expect(result).toBeUndefined();
    });

    test("should return undefined for an empty array", () => {
      const result = findFirstMatch([]);
      expect(result).toBeUndefined();
    });

    test("should return the only file if it exists", () => {
      const file = path.join(tempDir, "single.txt");
      fs.writeFileSync(file, "content");
      testFiles.push(file);

      const result = findFirstMatch([file]);
      expect(result).toBe(file);
    });

    test("should handle invalid paths gracefully", () => {
      const file1 = path.join(tempDir, "valid.txt");
      fs.writeFileSync(file1, "content");
      testFiles.push(file1);

      // Include some potentially problematic paths along with a valid one
      const result = findFirstMatch(["\0invalid", file1]);
      expect(result).toBe(file1);
    });

    test("should return the first match even when multiple files exist", () => {
      const file1 = path.join(tempDir, "first.txt");
      const file2 = path.join(tempDir, "second.txt");
      const file3 = path.join(tempDir, "third.txt");

      // Create all files
      fs.writeFileSync(file1, "content1");
      fs.writeFileSync(file2, "content2");
      fs.writeFileSync(file3, "content3");
      testFiles.push(file1, file2, file3);

      const result = findFirstMatch([file1, file2, file3]);
      expect(result).toBe(file1);
    });
  });
});

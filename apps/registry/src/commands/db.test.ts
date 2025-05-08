import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "../db";
import { entriesTable } from "../db/schema";
import { getEntryByName } from "./db";

describe("getEntryByName", () => {
  const testEntry = {
    id: "test-id",
    name: "test-server",
    description: "A test server",
    verified: false,
    provider: "github.com",
    providerVerified: false,
    createdDate: new Date(),
    runtime: "TypeScript",
    license: "MIT",
    sourceUrl: "https://github.com/test/test-server",
    transport: {
      type: "stdio" as const,
      command: "echo",
      args: ["https://github.com/test/test-server"],
    },
    source: {
      type: "github" as const,
      url: "https://github.com/test/test-server",
    },
    sourceRegistry: {
      name: "test-registry",
    },
    categories: ["test", "example"],
    tools: [
      {
        name: "test-tool",
        description: "A test tool",
      },
    ],
    parameters: [
      {
        name: "test_param",
        description: "A test parameter",
        required: false,
      },
    ],
    readme: null,
  };

  beforeAll(async () => {
    // Insert test data
    await db.insert(entriesTable).values(testEntry);
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(entriesTable).where(eq(entriesTable.id, testEntry.id));
  });

  it("should return the correct entry when it exists", async () => {
    const entry = await getEntryByName("test-server");
    expect(entry).toBeDefined();
    expect(entry.name).toBe("test-server");
    expect(entry.description).toBe("A test server");
    expect(entry.runtime).toBe("TypeScript");
  });

  it("should throw an error when entry does not exist", async () => {
    await expect(getEntryByName("non-existent-server")).rejects.toThrow(
      "No entry found with name: non-existent-server",
    );
  });
});

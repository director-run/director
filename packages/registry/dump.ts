import { writeFileSync } from "fs";
import { db } from "./src/db";
import { entriesTable } from "./src/db/schema";

async function dumpToCSV() {
  // Fetch all entries
  const entries = await db.select().from(entriesTable);

  // Define CSV headers
  const headers = [
    "id",
    "name",
    "description",
    "transport_type",
    "transport_command",
    "transport_args",
    "source_type",
    "source_url",
    "source_registry_name",
    "categories",
  ];

  // Convert entries to CSV rows
  const rows = entries.map((entry) => {
    return [
      entry.id,
      entry.name,
      entry.description,
      entry.transport.type,
      entry.transport.command,
      JSON.stringify(entry.transport.args),
      entry.source.type,
      entry.source.url,
      entry.sourceRegistry.name,
      JSON.stringify(entry.categories),
    ].map((value) => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes("\n") ||
        stringValue.includes('"')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Write to file
  writeFileSync("entries.csv", csvContent);
  console.log("Successfully created entries.csv");
}

// Run the dump
(async () => {
  try {
    await dumpToCSV();
  } catch (error) {
    console.error("Error creating CSV:", error);
    process.exit(1);
  }
})();
